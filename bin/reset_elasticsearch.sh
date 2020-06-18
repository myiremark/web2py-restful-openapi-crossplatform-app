#!/bin/bash

set -eux;

INDEX_NAME="inventoryitems";

curl -H'Content-Type: application/json' -XPOST 'localhost:9200/'"$INDEX_NAME"'/_delete_by_query?conflicts=proceed' -d' { "query": { "match_all": {} }}'

