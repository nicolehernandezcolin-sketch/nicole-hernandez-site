// Cuts the Nicole Hernandez wordmark out of its solid blue square and saves
// transparent PNGs in any colour.
//
// Usage (from the site folder):
//   swift tools/make_wordmark.swift brand/nicole-hernandez-logo-blue.png images
//
// Writes:
//   images/wordmark-cream.png   (for blue / photo backgrounds)
//   images/wordmark-cobalt.png  (for cream paper backgrounds)

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else {
    print("usage: swift make_wordmark.swift <logo.png> <out-dir>")
    exit(1)
}
let inURL = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])

guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    print("could not read \(inURL.path)"); exit(1)
}

let w = img.width, h = img.height
var px = [UInt8](repeating: 0, count: w * h * 4)
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))

func rgb(_ i: Int) -> (Double, Double, Double) {
    (Double(px[i * 4]), Double(px[i * 4 + 1]), Double(px[i * 4 + 2]))
}

// Background = top-left corner; letter colour = brightest pixel.
let bg = rgb(0)
var fg = bg
var best = -1.0
for i in 0..<(w * h) {
    let (r, g, b) = rgb(i)
    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if lum > best { best = lum; fg = (r, g, b) }
}

// Alpha = how far each pixel sits between background and letter colour.
let d = (fg.0 - bg.0, fg.1 - bg.1, fg.2 - bg.2)
let dd = d.0 * d.0 + d.1 * d.1 + d.2 * d.2
var alpha = [Double](repeating: 0, count: w * h)
var minX = w, minY = h, maxX = 0, maxY = 0
for y in 0..<h {
    for x in 0..<w {
        let i = y * w + x
        let (r, g, b) = rgb(i)
        var t = ((r - bg.0) * d.0 + (g - bg.1) * d.1 + (b - bg.2) * d.2) / dd
        t = min(1, max(0, (t - 0.04) / 0.92))   // trim faint noise, keep soft edges
        alpha[i] = t
        if t > 0.05 {
            minX = min(minX, x); maxX = max(maxX, x)
            minY = min(minY, y); maxY = max(maxY, y)
        }
    }
}

// Crop to the letters with a little breathing room.
let pad = 12
minX = max(0, minX - pad); minY = max(0, minY - pad)
maxX = min(w - 1, maxX + pad); maxY = min(h - 1, maxY + pad)
let cw = maxX - minX + 1, ch = maxY - minY + 1

func write(_ name: String, _ c: (UInt8, UInt8, UInt8)) {
    var out = [UInt8](repeating: 0, count: cw * ch * 4)
    for y in 0..<ch {
        for x in 0..<cw {
            let a = alpha[(y + minY) * w + (x + minX)]
            let o = (y * cw + x) * 4
            out[o] = UInt8(Double(c.0) * a)
            out[o + 1] = UInt8(Double(c.1) * a)
            out[o + 2] = UInt8(Double(c.2) * a)
            out[o + 3] = UInt8(255 * a)
        }
    }
    let octx = CGContext(data: &out, width: cw, height: ch, bitsPerComponent: 8, bytesPerRow: cw * 4,
                         space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    let cg = octx.makeImage()!
    let url = outDir.appendingPathComponent(name)
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, cg, nil)
    CGImageDestinationFinalize(dest)
    print("wrote \(url.path) (\(cw)x\(ch))")
}

write("wordmark-cream.png", (255, 250, 240))
write("wordmark-cobalt.png", (0x0a, 0x47, 0xa8))
print(String(format: "background rgb(%.0f,%.0f,%.0f)", bg.0, bg.1, bg.2))
