#!/usr/bin/env bash
app="gaimin-platform"

prev_release_tag=$(git describe --abbrev=0 --tags)
number_version_prefix="gaimin-platform-v"
prev_release_version_number=${prev_release_tag#"$number_version_prefix"}
echo "Previous release version is: $prev_release_version_number"
echo "Updating version in package.json"
cd gaimin-platform
npm version $prev_release_version_number
release_version=$(npm version patch -s)

echo "Clearing /dist folder"
rm -rf dist

echo "Releasing $app-$release_version"

echo "Packaging.."
npm run clean
npm run angular-build
npm run electron-build

npm run dist-win
# npm run dist-mac

echo "Publishing $app-$release_version to Google Storage.."
gsutil cp ./dist/$app-$release_version.exe gs://gaimin-platform/artifacts/$app/$release_version/win/
#gsutil cp ./dist/$app-$release_version.dmg gs://gaimin-platform/artifacts/$app/$release_version/mac/

gsutil cp dist/*.exe gs://platform_release_win
gsutil cp dist/*.yml gs://platform_release_win

echo "Tagging.."
git add .
git commit -m "$app-$release_version release"
git push origin HEAD
git tag "$app-$release_version"
git push origin "$app-$release_version"
