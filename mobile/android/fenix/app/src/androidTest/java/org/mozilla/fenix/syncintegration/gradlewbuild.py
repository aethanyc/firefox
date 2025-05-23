import logging
import os
import subprocess

from .adbrun import ADBrun

here = os.path.dirname(__file__)
logging.getLogger(__name__).addHandler(logging.NullHandler())


class GradlewBuild:
    binary = "./gradlew"
    logger = logging.getLogger()
    adbrun = ADBrun()

    def __init__(self, log):
        self.log = log

    def test(self, identifier):
        self.adbrun.launch()

        # Change path accordingly to go to root folder to run gradlew
        os.chdir("../../../../../../../..")
        cmd = (
            "./gradlew "
            + f"app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=org.mozilla.fenix.syncintegration.SyncIntegrationTest#{identifier}"
        )

        self.logger.info(f"Running cmd: {cmd}")

        out = ""
        try:
            out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
        except subprocess.CalledProcessError as e:
            out = e.output
            raise
        finally:
            # Set the path correctly
            testsPath = "app/src/androidTest/java/org/mozilla/fenix/syncintegration/"
            os.chdir(testsPath)

            with open(self.log, "w") as f:
                f.write(str(out))
