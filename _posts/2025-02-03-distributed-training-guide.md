---
layout: post
title: "Distributed Training Guide: Scaling Machine Learning Across Multiple GPUs"
date: 2025-02-03
tags: [Distributed Computing, Deep Learning, Training, PyTorch, Performance]
excerpt: "Learn how to efficiently scale your ML models across multiple GPUs and machines using data parallelism, model parallelism, and distributed training frameworks."
---

## Introduction

As machine learning models grow larger, training becomes computationally expensive. Distributed training allows us to leverage multiple GPUs and machines to reduce training time significantly. This guide covers practical approaches to scaling your models.

## Why Distributed Training?

Modern models like GPT-3 (175B parameters) or PaLM (540B parameters) cannot fit on a single GPU. Even smaller models that technically fit often train faster when distributed due to parallelization.

**Benefits:**
- Reduced training time through parallelization
- Ability to train larger models
- Better hardware utilization
- Fault tolerance in large-scale operations

## Data Parallelism

The most common approach for distributed training is **data parallelism**, where the model is replicated across multiple devices, and training data is split among them.

### How It Works

```
Device 1: Model + Batch 1
Device 2: Model + Batch 2
Device 3: Model + Batch 3
Device 4: Model + Batch 4
```

Each device:
1. Processes its data batch
2. Computes local gradients
3. Synchronizes gradients across all devices
4. Updates model parameters

### PyTorch Implementation

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# Initialize distributed training
dist.init_process_group(backend="nccl")

# Wrap model with DDP
model = Model(...)
model = DDP(model)

# Train as usual
for epoch in range(num_epochs):
    for batch in dataloader:
        outputs = model(batch)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
```

## Model Parallelism

For extremely large models that don't fit on a single GPU, **model parallelism** splits the model across devices.

### Strategies

1. **Pipeline Parallelism**: Different layers on different devices
   - Device 1: Layers 1-10
   - Device 2: Layers 11-20
   - Device 3: Layers 21-30

2. **Tensor Parallelism**: Split tensors across devices
   - Useful for attention heads and feed-forward layers
   - Requires more communication overhead

### Trade-offs

| Approach | Memory | Communication | Ease |
|----------|--------|---------------|------|
| Data Parallelism | High | Low | Easy |
| Pipeline Parallelism | Low | Medium | Medium |
| Tensor Parallelism | Low | High | Hard |

## Advanced Techniques

### Gradient Accumulation

Simulate larger batch sizes without needing proportional memory:

```python
accumulation_steps = 4
for i, batch in enumerate(dataloader):
    outputs = model(batch)
    loss = criterion(outputs, labels)
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### Mixed Precision Training

Use lower precision (float16) for computation while keeping float32 for stability:

```python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for batch in dataloader:
    with autocast():
        outputs = model(batch)
        loss = criterion(outputs, labels)
    
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

### Gradient Checkpointing

Trade computation for memory by recomputing activations during backprop:

```python
import torch.utils.checkpoint as checkpoint

class Model(nn.Module):
    def forward(self, x):
        return checkpoint.checkpoint(self.layer1, x)
```

## Distributed Training Frameworks

### DeepSpeed (Microsoft)

Optimized for large-scale training with automatic mixed precision and gradient accumulation:

```bash
pip install deepspeed
deepspeed train.py --deepspeed_config ds_config.json
```

### Hugging Face Accelerate

Simplifies distributed training with minimal code changes:

```python
from accelerate import Accelerator

accelerator = Accelerator()
model, optimizer, train_dataloader = accelerator.prepare(
    model, optimizer, train_dataloader
)

for batch in train_dataloader:
    outputs = model(batch)
    loss = criterion(outputs, labels)
    accelerator.backward(loss)
    optimizer.step()
```

### PyTorch Lightning

High-level abstraction for distributed training:

```python
from pytorch_lightning import Trainer

trainer = Trainer(strategy="ddp", gpus=4)
trainer.fit(model, train_dataloader)
```

## Performance Optimization Tips

1. **Batch Size**: Larger batches improve GPU utilization but require more memory
2. **Learning Rate**: Often needs to scale with batch size
3. **Communication Overlapping**: Overlap gradient computation with communication
4. **Reduced Precision**: Use float16 when possible for 2-3x speedup
5. **Profiling**: Identify bottlenecks (compute vs. communication vs. I/O)

## Scaling Laws

Empirical studies show consistent scaling laws:

- **Compute Optimal Scaling**: To reach a target loss, there's an optimal model size and dataset size
- **Chinchilla Scaling**: Optimal training uses roughly equal tokens and parameters (e.g., 70B model trained on 1.4T tokens)
- **Power Laws**: Loss decreases roughly as 1/N where N is compute

## Conclusion

Distributed training is essential for modern deep learning. Starting with data parallelism for most applications, then exploring model parallelism or advanced techniques for larger scales. The ecosystem of tools like DeepSpeed and Hugging Face Accelerate makes it more accessible than ever.

The key is understanding your constraints—memory, communication, and time—and choosing the approach that best fits your hardware and model.
