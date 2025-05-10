#!/bin/bash

#
# ZED IDE config:
#
# "languages": {
# 	"TypeScript": {
# 		"formatter": {
# 			"external": {
# 				"command": "<full-path>/typescript-imports-sort/src/formatter.sh",
# 				"arguments": [
# 					"<full-path>/typescript-imports-sort/",
# 					"{buffer_path}"
# 				]
# 			}
# 		}
# 	}
# }

OUTPUT="$(cd $1 && node src/formatter.js $2)"
echo "${OUTPUT}"
