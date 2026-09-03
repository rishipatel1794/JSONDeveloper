import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "apps" / "web"
PROXY_DIR = ROOT / "apps" / "proxy"


def run(command, cwd):
    print("\n" + "=" * 60)
    print("Running:", " ".join(command))
    print("Directory:", cwd)
    print("=" * 60)

    result = subprocess.run(command, cwd=cwd, shell=True)

    if result.returncode != 0:
        print("\n❌ Command failed.")
        sys.exit(result.returncode)


def main():
    print("🚀 JSONDeveloper Deployment")

    # 1. Deploy backend proxy Worker
    run(
        ["pnpm", "exec", "wrangler", "deploy"],
        PROXY_DIR
    )

    # 2. Build frontend
    run(
        ["pnpm", "run", "build"],
        WEB_DIR
    )

    # 3. Deploy frontend to Cloudflare
    run(
        ["pnpm", "exec", "wrangler", "deploy"],
        WEB_DIR
    )

    print("\n" + "=" * 60)
    print("✅ BUILD + DEPLOY SUCCESSFUL (backend + frontend)")
    print("=" * 60)


if __name__ == "__main__":
    main()