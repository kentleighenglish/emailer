#!/bin/bash

tag=$CI_BUILD_REF_SLUG

name="email-nec"

if [ "$tag" != 'master' ]; then
	name="$name:$tag"
fi

ACCESS_TOKEN="SCW83QNN0H0E3XZWRP9M"
SECRET_TOKEN="924a5af7-ce1c-445a-921b-b99ab3802e92"

echo "Logging in"
docker login rg.nl-ams.scw.cloud/ikenga -u $ACCESS_TOKEN -p $SECRET_TOKEN

echo "Building $name";
docker build -t $name .;

echo "Tagging..."
docker tag $name rg.nl-ams.scw.cloud/ikenga/$name

echo "Pushing..."
docker push rg.nl-ams.scw.cloud/ikenga/$name
