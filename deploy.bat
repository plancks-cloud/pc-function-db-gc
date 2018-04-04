gcloud config set project plancks-cloud
gcloud beta functions deploy pc-function-db-gc-v1 --trigger-http --memory=128MB --entry-point=handle