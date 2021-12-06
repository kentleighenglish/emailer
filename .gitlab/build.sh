#!/bin/bash

tag=$CI_BUILD_REF_SLUG

name="email-nec"

if [ "$tag" != 'master' ]; then
	name="$name:$tag"
fi

echo "Logging in"
docker login rg.nl-ams.scw.cloud/ikenga -u $ACCESS_TOKEN -p $SECRET_TOKEN

echo "Building $name";
docker build -t $name .;

echo "Tagging..."
docker tag $name rg.nl-ams.scw.cloud/ikenga/$name

echo "Pushing..."
docker push rg.nl-ams.scw.cloud/ikenga/$name
