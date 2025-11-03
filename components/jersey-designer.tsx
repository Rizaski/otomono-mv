"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Upload,
  Type,
  Hash,
  ImageIcon,
  Palette,
  Layers,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo,
  Redo,
  FlipHorizontal,
} from "lucide-react"
import Jersey3D from "@/components/jersey-3d"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { cn } from "@/lib/utils"

type Tool = "design" | "color" | "pattern" | "number" | "name" | "text" | "logo"
type JerseyView = "front" | "back"

type PatternType =
  | "solid"
  | "vertical-stripes"
  | "horizontal-stripes"
  | "diagonal-stripes"
  | "checkered"
  | "gradient"
  | "side-panels"
  | "chevron"
  | "diamond"
  | "split"
  | "wave"
  | "geometric"

export default function JerseyDesigner() {
  const [activeTool, setActiveTool] = useState<Tool>("design")
  const [view, setView] = useState<JerseyView>("front")
  const [jerseyColor, setJerseyColor] = useState("#1e40af")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")
  const [frontPlayerName, setFrontPlayerName] = useState("PLAYER")
  const [backPlayerName, setBackPlayerName] = useState("PLAYER")
  const [frontPlayerNumber, setFrontPlayerNumber] = useState("10")
  const [backPlayerNumber, setBackPlayerNumber] = useState("10")
  const [frontTeamName, setFrontTeamName] = useState("TEAM NAME")
  const [backTeamName, setBackTeamName] = useState("")
  const [frontLogo, setFrontLogo] = useState<string | null>(null)
  const [backLogo, setBackLogo] = useState<string | null>(null)
  const [textColor, setTextColor] = useState("#ffffff")
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [selectedPattern, setSelectedPattern] = useState<PatternType>("solid")
  const canvasRef = useRef<HTMLDivElement>(null)

  const templates = [
    { id: 0, name: "Classic Stripes", primary: "#1e40af", secondary: "#ffffff" },
    { id: 1, name: "Bold Red", primary: "#dc2626", secondary: "#ffffff" },
    { id: 2, name: "Forest Green", primary: "#16a34a", secondary: "#ffffff" },
    { id: 3, name: "Black & Gold", primary: "#000000", secondary: "#fbbf24" },
    { id: 4, name: "Royal Purple", primary: "#7c3aed", secondary: "#ffffff" },
    { id: 5, name: "Navy Blue", primary: "#1e3a8a", secondary: "#60a5fa" },
  ]

  const patterns = [
    { id: "solid", name: "Solid", preview: "bg-gradient-to-br" },
    { id: "vertical-stripes", name: "Vertical Stripes", preview: "bg-gradient-to-r" },
    { id: "horizontal-stripes", name: "Horizontal Stripes", preview: "bg-gradient-to-b" },
    { id: "diagonal-stripes", name: "Diagonal Stripes", preview: "bg-gradient-to-br" },
    { id: "checkered", name: "Checkered", preview: "bg-gradient-to-br" },
    { id: "gradient", name: "Gradient", preview: "bg-gradient-to-t" },
    { id: "side-panels", name: "Side Panels", preview: "bg-gradient-to-r" },
    { id: "chevron", name: "Chevron", preview: "bg-gradient-to-b" },
    { id: "diamond", name: "Diamond", preview: "bg-gradient-to-br" },
    { id: "split", name: "Split", preview: "bg-gradient-to-r" },
    { id: "wave", name: "Wave", preview: "bg-gradient-to-b" },
    { id: "geometric", name: "Geometric", preview: "bg-gradient-to-br" },
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (view === "front") {
          setFrontLogo(event.target?.result as string)
        } else {
          setBackLogo(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownloadImage = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `jersey-design-${view}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleDownloadPDF = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`jersey-design-${view}.pdf`)
    }
  }

  const handleTemplateSelect = (template: (typeof templates)[0]) => {
    setSelectedTemplate(template.id)
    setJerseyColor(template.primary)
    setSecondaryColor(template.secondary)
  }

  const tools = [
    { id: "design" as Tool, icon: Layers, label: "Design" },
    { id: "color" as Tool, icon: Palette, label: "Color" },
    { id: "pattern" as Tool, icon: Layers, label: "Pattern" },
    { id: "number" as Tool, icon: Hash, label: "Number" },
    { id: "name" as Tool, icon: User, label: "Name" },
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "logo" as Tool, icon: ImageIcon, label: "Logo" },
  ]

  const currentPlayerName = view === "front" ? frontPlayerName : backPlayerName
  const currentPlayerNumber = view === "front" ? frontPlayerNumber : backPlayerNumber
  const currentTeamName = view === "front" ? frontTeamName : backTeamName
  const currentLogo = view === "front" ? frontLogo : backLogo

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="w-20 border-r border-zinc-800 bg-zinc-900 flex flex-col items-center py-6 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg transition-all w-16",
              activeTool === tool.id
                ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
            )}
          >
            <tool.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}

        <div className="mt-auto flex flex-col gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-96 border-r border-zinc-800 bg-zinc-900 overflow-y-auto">
        <div className="p-6">
          {activeTool === "design" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Select design</h2>
                <p className="text-sm text-zinc-400">Choose a standard design</p>
              </div>

              <div className="flex gap-2 border-b border-zinc-800">
                <button className="px-4 py-2 text-sm font-medium text-red-500 border-b-2 border-red-500">
                  Designs
                </button>
                <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">
                  Best customer designs
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={cn(
                      "border-2 rounded-lg p-3 transition-all hover:border-red-500",
                      selectedTemplate === template.id
                        ? "border-red-600 ring-2 ring-red-900/50 bg-zinc-800"
                        : "border-zinc-700 bg-zinc-800/50",
                    )}
                  >
                    <div className="aspect-square bg-zinc-950 rounded flex items-center justify-center mb-2">
                      <div
                        className="w-16 h-20 rounded"
                        style={{
                          background: `linear-gradient(135deg, ${template.primary} 60%, ${template.secondary} 60%)`,
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-zinc-300">{template.name}</p>
                  </button>
                ))}
              </div>

              <Button variant="outline" className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                <Upload className="mr-2 h-4 w-4" />
                Add product
              </Button>
            </div>
          )}

          {activeTool === "color" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Color customization</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jersey-color" className="text-zinc-300">
                    Primary Jersey Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="jersey-color"
                      type="color"
                      value={jerseyColor}
                      onChange={(e) => setJerseyColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={jerseyColor}
                      onChange={(e) => setJerseyColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color" className="text-zinc-300">
                    Secondary Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-color" className="text-zinc-300">
                    Text Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTool === "pattern" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Select pattern</h2>
                <p className="text-sm text-zinc-400">Choose a jersey pattern</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {patterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern.id as PatternType)}
                    className={cn(
                      "border-2 rounded-lg p-3 transition-all hover:border-red-500",
                      selectedPattern === pattern.id
                        ? "border-red-600 ring-2 ring-red-900/50 bg-zinc-800"
                        : "border-zinc-700 bg-zinc-800/50",
                    )}
                  >
                    <div className="aspect-square bg-zinc-950 rounded flex items-center justify-center mb-2">
                      <div
                        className={cn("w-16 h-20 rounded", pattern.preview)}
                        style={{
                          backgroundImage: `linear-gradient(${pattern.id.includes("vertical") ? "90deg" : pattern.id.includes("horizontal") ? "180deg" : "135deg"}, ${jerseyColor} 0%, ${jerseyColor} 45%, ${secondaryColor} 45%, ${secondaryColor} 55%, ${jerseyColor} 55%, ${jerseyColor} 100%)`,
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-zinc-300">{pattern.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTool === "number" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Player number</h2>

              <div className="space-y-2">
                <Label htmlFor="player-number" className="text-zinc-300">
                  Number ({view === "front" ? "Front" : "Back"})
                </Label>
                <Input
                  id="player-number"
                  value={currentPlayerNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 2) {
                      if (view === "front") {
                        setFrontPlayerNumber(value)
                      } else {
                        setBackPlayerNumber(value)
                      }
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                  className="text-2xl text-center font-bold bg-zinc-800 border-zinc-700 text-white"
                />
                <p className="text-sm text-zinc-400">Enter a number between 0-99</p>
              </div>
            </div>
          )}

          {activeTool === "name" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Player name</h2>

              <div className="space-y-2">
                <Label htmlFor="player-name" className="text-zinc-300">
                  Name ({view === "front" ? "Front" : "Back"})
                </Label>
                <Input
                  id="player-name"
                  value={currentPlayerName}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    if (view === "front") {
                      setFrontPlayerName(value)
                    } else {
                      setBackPlayerName(value)
                    }
                  }}
                  placeholder="Enter player name"
                  maxLength={15}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <p className="text-sm text-zinc-400">Maximum 15 characters</p>
              </div>
            </div>
          )}

          {activeTool === "text" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Team text</h2>

              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-zinc-300">
                  Team Name ({view === "front" ? "Front" : "Back"})
                </Label>
                <Input
                  id="team-name"
                  value={currentTeamName}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    if (view === "front") {
                      setFrontTeamName(value)
                    } else {
                      setBackTeamName(value)
                    }
                  }}
                  placeholder="Enter team name"
                  maxLength={20}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <p className="text-sm text-zinc-400">Maximum 20 characters</p>
              </div>
            </div>
          )}

          {activeTool === "logo" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Team logo</h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-red-500 transition-colors bg-zinc-800/50">
                  <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-zinc-500" />
                    <p className="text-sm font-medium text-zinc-300">Click to upload</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, SVG up to 5MB</p>
                    <p className="text-xs text-zinc-400 mt-2">Uploading for: {view === "front" ? "Front" : "Back"}</p>
                  </label>
                </div>

                {currentLogo && (
                  <div className="space-y-3">
                    <Label className="text-zinc-300">Logo Preview ({view === "front" ? "Front" : "Back"})</Label>
                    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                      <img
                        src={currentLogo || "/placeholder.svg"}
                        alt="Team logo"
                        className="max-h-32 mx-auto object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (view === "front") {
                          setFrontLogo(null)
                        } else {
                          setBackLogo(null)
                        }
                      }}
                      className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-zinc-950 relative">
        <div ref={canvasRef} className="w-full h-full">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }} shadows>
            <ambientLight intensity={0.3} />
            <spotLight
              position={[5, 8, 5]}
              angle={0.3}
              penumbra={1}
              intensity={2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={0.8} color="#ff3333" />
            <pointLight position={[0, -3, 3]} intensity={0.5} color="#3366ff" />
            <Jersey3D
              jerseyColor={jerseyColor}
              secondaryColor={secondaryColor}
              playerName={currentPlayerName}
              playerNumber={currentPlayerNumber}
              teamName={currentTeamName}
              logo={currentLogo}
              textColor={textColor}
              view={view}
              pattern={selectedPattern}
            />
            <OrbitControls
              enablePan={false}
              minDistance={4}
              maxDistance={10}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Environment preset="night" />
          </Canvas>
        </div>

        <div className="absolute left-6 top-6">
          <Button
            onClick={() => setView(view === "front" ? "back" : "front")}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-900/50"
          >
            <FlipHorizontal className="mr-2 h-4 w-4" />
            {view === "front" ? "View Back" : "View Front"}
          </Button>
        </div>

        <div className="absolute right-6 top-6 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-2">
          <Button
            onClick={handleDownloadImage}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-900/50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
