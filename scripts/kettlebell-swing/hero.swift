// 記事「ケトルベルをご存じだろうか？」の heroImage（記事の先頭と一覧のカードに出る）の3Dのケトルベルの絵を作る
// 使い方（Mac のみ）：
//   swiftc -O -o <作業用フォルダ>/hero scripts/kettlebell-swing/hero.swift
//   <作業用フォルダ>/hero src/assets/blog/kettlebell-benefits-hero.jpg
// 16:9。床に置いた12kgのケトルベルを、少し上から見下ろす。文字やロゴは入れない
import AppKit
import Metal
import SceneKit

let S: CGFloat = 0.01 // 1 = 1cm

func color(_ hex: Int) -> NSColor {
	NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: 1)
}
func material(_ hex: Int, rough: CGFloat, metal: CGFloat = 0) -> SCNMaterial {
	let m = SCNMaterial()
	m.lightingModel = .physicallyBased
	m.diffuse.contents = color(hex)
	m.roughness.contents = rough
	m.metalness.contents = metal
	return m
}

let scene = SCNScene()
scene.background.contents = color(0xF2EEE9)

// 胴は青磁の塗装、ハンドルは少しつやのある同じ色
let coat = material(0x2A6058, rough: 0.48)
let base = material(0x1F4842, rough: 0.7)

let bell = SCNNode()
scene.rootNode.addChildNode(bell)
let bodyGeo = SCNSphere(radius: 10.5 * S)
bodyGeo.segmentCount = 128
bodyGeo.firstMaterial = coat
let body = SCNNode(geometry: bodyGeo)
body.scale = SCNVector3(1, 0.95, 1)
body.position = SCNVector3(0, 10.2 * S, 0)
bell.addChildNode(body)
// 底の平らなところ
let footGeo = SCNCylinder(radius: 4.6 * S, height: 0.6 * S)
footGeo.radialSegmentCount = 96
footGeo.firstMaterial = base
let foot = SCNNode(geometry: footGeo)
foot.position = SCNVector3(0, 0.3 * S, 0)
bell.addChildNode(foot)
// ハンドル：縦に少し長い輪の上半分が胴から出る
let handleGeo = SCNTorus(ringRadius: 7.0 * S, pipeRadius: 1.8 * S)
handleGeo.ringSegmentCount = 128
handleGeo.pipeSegmentCount = 48
handleGeo.firstMaterial = coat
let handle = SCNNode(geometry: handleGeo)
handle.position = SCNVector3(0, 17.6 * S, 0)
handle.eulerAngles = SCNVector3(CGFloat.pi / 2, 0, 0)
handle.scale = SCNVector3(1.12, 1, 1.0)
bell.addChildNode(handle)
bell.eulerAngles = SCNVector3(0, -0.28, 0)

/* 床（影だけ落とす） */
let floorGeo = SCNFloor()
floorGeo.reflectivity = 0
let floorM = SCNMaterial()
floorM.lightingModel = .shadowOnly
floorGeo.firstMaterial = floorM
scene.rootNode.addChildNode(SCNNode(geometry: floorGeo))

/* 光 */
let key = SCNLight()
key.type = .directional
key.intensity = 900
key.castsShadow = true
key.shadowMapSize = CGSize(width: 4096, height: 4096)
key.shadowSampleCount = 32
key.shadowRadius = 8
key.shadowColor = NSColor(white: 0, alpha: 0.38)
key.orthographicScale = 0.6
key.zNear = 0.1
key.zFar = 20
let keyNode = SCNNode()
keyNode.light = key
keyNode.position = SCNVector3(-1.6, 3, 1.8)
keyNode.look(at: SCNVector3(0, 0.12, 0))
scene.rootNode.addChildNode(keyNode)
let fill = SCNLight()
fill.type = .directional
fill.intensity = 260
let fillNode = SCNNode()
fillNode.light = fill
fillNode.position = SCNVector3(2, 1, 2)
fillNode.look(at: SCNVector3(0, 0.12, 0))
scene.rootNode.addChildNode(fillNode)
let rim = SCNLight()
rim.type = .directional
rim.intensity = 420
let rimNode = SCNNode()
rimNode.light = rim
rimNode.position = SCNVector3(1.2, 1.6, -2.5)
rimNode.look(at: SCNVector3(0, 0.12, 0))
scene.rootNode.addChildNode(rimNode)
let amb = SCNLight()
amb.type = .ambient
amb.intensity = 320
let ambNode = SCNNode()
ambNode.light = amb
scene.rootNode.addChildNode(ambNode)

/* カメラ */
let cam = SCNCamera()
cam.fieldOfView = 22
cam.zNear = 0.05
cam.zFar = 20
cam.wantsHDR = true
cam.wantsExposureAdaptation = false
cam.screenSpaceAmbientOcclusionIntensity = 1.2
cam.screenSpaceAmbientOcclusionRadius = 0.04
let camNode = SCNNode()
camNode.camera = cam
let p: CGFloat = 16 * .pi / 180
let d: CGFloat = 0.92
camNode.position = SCNVector3(0, 0.125 + d * sin(p), d * cos(p))
camNode.look(at: SCNVector3(0, 0.125, 0))
scene.rootNode.addChildNode(camNode)

let renderer = SCNRenderer(device: MTLCreateSystemDefaultDevice(), options: nil)
renderer.scene = scene
renderer.pointOfView = camNode
renderer.autoenablesDefaultLighting = false
let img = renderer.snapshot(atTime: 0, with: CGSize(width: 2040, height: 1148), antialiasingMode: .multisampling4X)
let rep = NSBitmapImageRep(cgImage: img.cgImage(forProposedRect: nil, context: nil, hints: nil)!)
try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.86])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
print("hero ok")
