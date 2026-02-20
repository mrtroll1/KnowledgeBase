# Lesson 5 Quiz — Answers

## Q1
- **Liveness probe failing** → Kubernetes **restarts** the container (kill + recreate). It assumes the process is stuck/deadlocked.
- **Readiness probe failing** → Kubernetes **removes the pod from the Service endpoints**. The pod stays running but receives no traffic until readiness passes again.

## Q2
The pod enters CrashLoopBackOff. `30 + (10 × 3) = 60s` — liveness starts checking at 30s, fails 3 times by 60s, kills the container before postgres finishes its 90s init. Fix: add a `startupProbe` that gates liveness/readiness until the initial boot completes. Better than increasing `initialDelaySeconds` because it separates "how long to boot" from "how often to health-check at runtime."

## Q3
a) **Burstable** — requests and limits are set but not equal.

b) **OOMKilled** — 300Mi exceeds the 256Mi memory limit. The kernel kills the process immediately. Memory can't be throttled because once allocated, the kernel can't reclaim pages without killing the process.

c) **Throttled** — 500m exceeds the 400m CPU limit, but CPU is time-sliceable. Kubernetes simply gives the container fewer CPU cycles. No kill, just slower execution.

## Q4
`desiredReplicas = ceil(currentReplicas × (currentUtilization / targetUtilization))`
`= ceil(2 × (90 / 50))`
`= ceil(3.6)`
`= 4 replicas`

## Q5
Every Helm upgrade resets the replica count to the hardcoded `replicas: 3`, fighting the HPA. Fix: use `{{- if not .Values.autoscaling.enabled }}` around the `replicas` field so it's omitted when HPA is managing scale.
