# Lesson 1: Services & Networking — Answers

## Q1
It technically can if it knows the IP — but even then, it would have to do load balancing between the three replicas itself. And each time payment pods redeploy, checkout would need to be notified of their new IPs. Services solve this with a stable IP + DNS name + automatic load balancing.

## Q2
Label mismatch. Service selector says `app: payment-svc` but pod label says `app: payment-service`. No pods match, no traffic routed. No error — just silence.

## Q3
`http://auth.security` (or fully qualified: `auth.security.svc.cluster.local`). Same namespace = just the name, different namespace = name.namespace.

## Q4
ClusterIP. LoadBalancer provisions external cloud infrastructure you don't need for internal traffic — wasted money and unnecessary attack surface. ClusterIP also load balances across pods, just without external exposure.

## Q5
They're nesting dolls, not separate mechanisms. LoadBalancer ⊃ NodePort ⊃ ClusterIP. Creating a LoadBalancer automatically creates a NodePort and ClusterIP under it. External traffic flows LB → NodePort → ClusterIP → Pod, but internal traffic skips straight to ClusterIP.
