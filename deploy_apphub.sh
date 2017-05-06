# Taken from https://github.com/artsy/emission/blob/master/scripts/deploy_apphub.sh

# See: https://github.com/joshuapinter/apphubdeploy
#

# Set up our npm environment again
npm install --global apphubdeploy apphub

# Create a .apphub credentials file
echo "{\"appHubId\":\"ZE2CT3y0RmZayjoMQ8qb\",\"appHubSecret\":\"$APP_HUB_SECRET\"}" > .apphub

# Ship a debug build of our current RN
apphubdeploy --plist-file ./ios/wwdcfamily/Info.plist --target all

rm .apphub
