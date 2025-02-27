#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { BootstraplessStackSynthesizer, CompositeECRRepositoryAspect } from 'cdk-bootstrapless-synthesizer';
import 'source-map-support/register';
import { AISolutionKitCpuBetaStack } from './api-deployment/ai-solution-kit-cpu-beta-stack';
import { AISolutionKitOcrBetaStack } from './api-deployment/ai-solution-kit-ocr-beta-stack';
import { AISolutionKitLambdaMemoryLessStack } from './api-deployment/ai-solution-kit-lambda-memory-less-stack';
import { AISolutionKitStack } from './api-deployment/ai-solution-kit-stack';
import { LambdaContainersStack } from './containers/lambda-containers-stack';


const app = new App();
const buildContainers = app.node.tryGetContext('build-container');
const deployContainers = app.node.tryGetContext('deploy-container');

if (buildContainers === 'true' || deployContainers === 'true') {
  console.log('Building containers');
  // Docker images building stack
  new LambdaContainersStack(app, 'Lambda-Containers-Stack', {
    synthesizer: synthesizer(),
    tags: {
      app: 'ai-solution-kit',
    },
  });
} else {
  // CloudFormation deployment stack - Default
  const ecrRegistry = app.node.tryGetContext('ecrRegistry');
  console.log('Use ECR Resistry: ' + ecrRegistry);

  new AISolutionKitStack(app, 'AI-Solution-Kit', {
    synthesizer: synthesizer(),
    ecrRegistry: ecrRegistry === 'undefined' ? 'public.ecr.aws/aws-gcr-solutions/aws-gcr-ai-solution-kit' : ecrRegistry,
    tags: {
      app: 'ai-solution-kit',
    },
  });
  new AISolutionKitOcrBetaStack(app, 'AI-Solution-Kit-Advanced-Ocr-SageMaker', {
    synthesizer: synthesizer(),
    ecrRegistry: ecrRegistry === 'undefined' ? 'public.ecr.aws/aws-gcr-solutions/aws-gcr-ai-solution-kit' : ecrRegistry,
    tags: {
      app: 'ai-solution-kit',
    },
  });
  new AISolutionKitCpuBetaStack(app, 'AI-Solution-Kit-Cpu-Beta-SageMaker', {
    synthesizer: synthesizer(),
    ecrRegistry: ecrRegistry === 'undefined' ? 'public.ecr.aws/aws-gcr-solutions/aws-gcr-ai-solution-kit' : ecrRegistry,
    tags: {
      app: 'ai-solution-kit',
    },
  });
  new AISolutionKitLambdaMemoryLessStack(app, 'AI-Solution-Kit-Lambda-Memory-Less-Stack', {
    synthesizer: synthesizer(),
    ecrRegistry: ecrRegistry === 'undefined' ? 'public.ecr.aws/aws-gcr-solutions/aws-gcr-ai-solution-kit' : ecrRegistry,
    tags: {
      app: 'ai-solution-kit',
    },
  });

}

if (process.env.USE_BSS) {
  Aspects.of(app).add(new CompositeECRRepositoryAspect());
}

app.synth();

function synthesizer() {
  return process.env.USE_BSS ? new BootstraplessStackSynthesizer() : undefined;
}