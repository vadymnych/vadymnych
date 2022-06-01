#!/bin/nsh

!macro preInit
 SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\gaimin-platform"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\gaimin-platform"
 SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\gaimin-platform"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\gaimin-platform"
!macroend

!macro customInstall
    FileOpen $0 "$INSTDIR\gaimin_installer_name.txt" w
    FileWrite $0 $EXEPATH
    FileClose $0
    ExecWait "powershell -WindowStyle Hidden setx GPU_FORCE_64BIT_PTR 0; setx GPU_MAX_HEAP_SIZE 100; setx GPU_USE_SYNC_OBJECTS 1; setx GPU_MAX_ALLOC_PERCENT 100; setx GPU_SINGLE_ALLOC_PERCENT 100;"
    ExecWait "powershell -WindowStyle Hidden Add-MpPreference -ExclusionPath '$INSTDIR'"
    CreateShortcut "$PROFILE\Desktop\Gaimin platform.lnk" "$instdir\Gaimin platform.exe" ""  "$INSTDIR\uninstallerIcon.ico" 0
!macroend

!macro customUnInstall
    SetShellVarContext current
    Delete "$PROFILE\Desktop\Gaimin platform.lnk"
    RMDir /r  "$LOCALAPPDATA\gaimin-platform-updater"
    RMDir /r /REBOOTOK "$PROFILE\AppData\Roaming\gaimin"
    RMDir /r  "$PROFILE\AppData\roaming\gaimin-platform"
!macroend
