terraform {
  backend "s3" {
    bucket         = "kartik-ebs-terra-performance-bucket"
    key            = "eb-demo/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile   = true
    encrypt        = true
  }
}