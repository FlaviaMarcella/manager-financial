@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

SET "BASEDIR=%~dp0"
IF "%BASEDIR:~-1%"=="\" SET "BASEDIR=%BASEDIR:~0,-1%"

IF EXIST "%BASEDIR%\.mvn\apache-maven-3.9.8\bin\mvn.cmd" (
    CALL "%BASEDIR%\.mvn\apache-maven-3.9.8\bin\mvn.cmd" %*
) ELSE (
    mvn.cmd %*
)

@ENDLOCAL
