---
layout: post
title: "Building Effective Question Answering Systems with Transformers"
date: 2025-02-20
tags: [NLP, Question Answering, Transformers, BERT, Information Retrieval]
excerpt: "Explore the architecture and training techniques for building robust question answering systems, from extractive to generative approaches."
---

## Introduction

Question Answering (QA) systems are among the most practical NLP applications, with use cases ranging from customer service chatbots to research paper search engines. This post covers the spectrum of QA approaches, from simple extractive methods to sophisticated generative models.

## QA System Architectures

### 1. Extractive Question Answering

Extractive QA finds answers by identifying relevant spans in provided context documents.

**Characteristics:**
- Answer must exist in the context
- Generally faster inference
- Easier to explain/verify

**Example:**
```
Context: "Albert Einstein was born in Germany in 1879."
Question: "Where was Einstein born?"
Answer: "Germany"
```

### 2. Generative Question Answering

Generative QA synthesizes answers from knowledge, not restricted to input text.

**Characteristics:**
- Can answer open-ended questions
- Requires larger models
- Answers are generated token-by-token

**Example:**
```
Question: "Why is the sky blue?"
Answer: "The sky appears blue because of Rayleigh scattering..."
```

### 3. Hybrid Approaches

Combine retrieval and generation:
1. Retrieve relevant documents
2. Generate answer based on retrieved context

## Extractive QA: BERT-based Approach

### Model Architecture

BERT-style extractive QA uses a pre-trained transformer encoder:

```
[CLS] question tokens [SEP] context tokens [SEP]
                              ↓
                    BERT Encoder (12 layers)
                              ↓
                    [Start Position, End Position]
```

### Training

```python
from transformers import AutoModelForQuestionAnswering, AutoTokenizer
import torch

model = AutoModelForQuestionAnswering.from_pretrained('bert-base-uncased')
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')

# Prepare inputs
inputs = tokenizer(question, context, return_tensors="pt")

# Forward pass
outputs = model(**inputs)
start_logits = outputs.start_logits  # Scores for each token as answer start
end_logits = outputs.end_logits      # Scores for each token as answer end

# Inference: find argmax positions
start_idx = torch.argmax(start_logits)
end_idx = torch.argmax(end_logits)

# Extract answer
answer = tokenizer.convert_tokens_to_string(
    tokenizer.convert_ids_to_tokens(inputs['input_ids'][0][start_idx:end_idx+1])
)
```

### SQuAD Dataset

Stanford Question Answering Dataset (SQuAD) is the standard benchmark:
- 100K+ question-answer pairs
- Answers are spans in Wikipedia articles
- Multiple reference answers per question

**Fine-tuning typically achieves:**
- EM (Exact Match): ~85-95% (exact match with reference)
- F1 Score: ~92-97% (overlap-based metric)

## Generative QA: Seq2Seq Approach

### Architecture

```
Question: "What is photosynthesis?"
    ↓
[Encoder] BERT/GPT encodes question
    ↓
[Decoder] Generates answer token-by-token
    ↓
Answer: "Photosynthesis is the process..."
```

### Implementation with Hugging Face

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Use T5 or BART
model = AutoModelForSeq2SeqLM.from_pretrained('t5-base')
tokenizer = AutoTokenizer.from_pretrained('t5-base')

# T5 uses task-specific prefixes
inputs = tokenizer(
    "question: What is AI? context: Artificial intelligence...",
    return_tensors="pt"
)

# Generate answer
outputs = model.generate(
    inputs['input_ids'],
    max_length=100,
    num_beams=4,  # Beam search
    early_stopping=True
)

answer = tokenizer.decode(outputs[0])
```

## Retrieval-Augmented Generation (RAG)

For knowledge-intensive tasks, retrieve relevant documents first:

```
Question
    ↓
[Retriever] Find k relevant documents
    ↓
Document 1, Document 2, ..., Document k
    ↓
[Generator] Generate answer with retrieved context
    ↓
Answer
```

### Implementation

```python
from transformers import RagRetriever, RagTokenForGeneration

retriever = RagRetriever.from_pretrained('facebook/rag-sequence-nq')
model = RagTokenForGeneration.from_pretrained('facebook/rag-sequence-nq')

# Retrieve and generate
inputs = tokenizer(question, return_tensors="pt")
generated = model.generate(
    input_ids=inputs['input_ids'],
    context_input_ids=None  # Retriever finds context
)

answer = tokenizer.batch_decode(generated)[0]
```

## Building a Custom QA System

### Step 1: Data Collection

```python
qa_data = [
    {
        "question": "Who wrote 1984?",
        "context": "George Orwell wrote 1984, a dystopian novel...",
        "answer": "George Orwell",
        "answer_start": 0
    },
    # ... more examples
]
```

### Step 2: Preprocessing

```python
def preprocess(examples):
    questions = [q.strip() for q in examples['question']]
    contexts = [c.strip() for c in examples['context']]
    
    inputs = tokenizer(
        questions,
        contexts,
        max_length=384,
        truncation="only_second",
        return_offsets_mapping=True,
        padding="max_length"
    )
    
    start_positions = []
    end_positions = []
    
    for i, answer in enumerate(examples['answer']):
        start_char = examples['answer_start'][i]
        end_char = start_char + len(answer)
        
        # Map character positions to token positions
        offsets = inputs['offset_mapping'][i]
        start_token = next((j for j, (s, e) in enumerate(offsets) 
                          if s <= start_char < e), 0)
        end_token = next((j for j, (s, e) in enumerate(offsets) 
                        if s < end_char <= e), len(offsets)-1)
        
        start_positions.append(start_token)
        end_positions.append(end_token)
    
    inputs['start_positions'] = start_positions
    inputs['end_positions'] = end_positions
    return inputs
```

### Step 3: Fine-tuning

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir='./qa_model',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
)

trainer.train()
```

## Evaluation Metrics

### Extractive QA

- **Exact Match (EM)**: Percentage of predictions that match reference exactly
- **F1 Score**: Overlap between predicted and reference answer

### Generative QA

- **ROUGE**: Overlap of n-grams and longest common subsequence
- **BLEU**: Precision of n-grams in generated output
- **METEOR**: Similar to BLEU but accounts for synonyms

## Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Out-of-domain questions | Transfer learning + domain adaptation |
| Long context | Hierarchical encoding, sparse attention |
| Multi-hop reasoning | Iterative retrieval, chain-of-thought prompting |
| Factual consistency | Retrieval-augmentation, fact verification |

## Conclusion

Question answering systems continue to advance with larger models and better training techniques. For production systems, consider:

1. **Extractive QA** for closed-domain, fast inference needs
2. **Generative QA** for open-ended, knowledge-intensive tasks
3. **RAG** for knowledge-grounded systems
4. **Ensemble approaches** combining multiple methods for robustness

The field is rapidly evolving, with new architectures and techniques emerging regularly. Staying updated with recent research and model releases is crucial for building state-of-the-art QA systems.
