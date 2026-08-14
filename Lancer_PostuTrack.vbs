Set WshShell = CreateObject("WScript.Shell")

' 1. Lance le serveur de façon 100% invisible
WshShell.Run "cmd /c npm run dev", 0, false

' 2. Patiente 3 secondes le temps que le serveur démarre
WScript.Sleep 3000

' 3. Ouvre l'application dans Edge
WshShell.Run "msedge --app=""http://localhost:5173"""

' 4. Met le script en pause avec une petite fenêtre de contrôle
MsgBox "Le serveur PostuTrack tourne en arrière-plan." & vbCrLf & vbCrLf & "Fermez votre application puis cliquez sur OK ici pour éteindre le serveur proprement.", 64, "Serveur PostuTrack"

' 5. Dès que vous cliquez sur OK, le script reprend ici et tue le serveur (Node.js) silencieusement
WshShell.Run "taskkill /F /IM node.exe", 0, false