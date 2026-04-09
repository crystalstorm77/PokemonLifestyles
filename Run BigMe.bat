@echo off
setlocal

REM ============================================================
REM SECTION A — Move into the MAUI project folder
REM ============================================================
set "ROOT=%~dp0"
pushd "%ROOT%LifestylesMaui" || (
    echo.
    echo Could not find the LifestylesMaui folder.
    echo Expected location:
    echo %ROOT%LifestylesMaui
    echo.
    pause
    exit /b 1
)

REM ============================================================
REM SECTION B — Run the MAUI Android app on the attached phone
REM ============================================================
echo.
echo Running LifestylesMaui on the attached Android phone...
echo.
dotnet run -f net10.0-android -p:AdbTarget=-d

REM ============================================================
REM SECTION C — Keep window open so you can read errors
REM ============================================================
echo.
echo Finished.
pause

popd
endlocal