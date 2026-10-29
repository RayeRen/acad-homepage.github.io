---
layout: page
title: Can soil data travel across regions?
permalink: /research/soil-transfer/
description: Instance-based transfer learning for undrained shear-strength prediction under domain shift.
img: /images/paper-tluss.png
importance: 1
status: Published study
period: '2026'
methods: Transfer learning · Kernel ridge regression · SHAP
---

<p class="research-status">PUBLISHED · GEOSYSTEMS AND GEOENVIRONMENT · 2026</p>
<p class="project-lead">Local soil observations are scarce. Data collected elsewhere can help—but only if differences between the regions are taken seriously.</p>

<p class="research-actions"><a href="https://doi.org/10.1016/j.geogeo.2026.100519">Read the article ↗</a> <a href="https://github.com/raiedahmed-lab/TL_USS_Prediction">Explore the code ↗</a></p>

{% include figure.liquid path="images/paper-tluss.png" alt="Research figure accompanying the cross-regional soil-strength transfer-learning study" caption="Research figure from the published study. The paper provides the full experimental context." %}

## The problem

A model trained in one region may not transfer reliably to soils elsewhere. This study asks whether instance-based transfer learning can improve undrained shear-strength prediction when a smaller local dataset is available.

## Why it matters

Undrained shear strength informs geotechnical assessment. Learning from existing observations can be useful, but a model must account for differences in the data rather than assuming that source and target soils are interchangeable.

## My contribution and collaboration

This first-authored paper grew from my undergraduate thesis at SUST. The study was conducted with Fahmida Rahman, Nur Md. Robiul Hoque, and Shriful Islam. The accompanying public repository contains Python implementations of the three transfer methods and credits the upstream algorithm authors. These methods are adapted applications of existing algorithms, not algorithms invented for this study.

## Approach

The study used **217 source observations from Finland** and **134 target observations from Sylhet, Bangladesh**. It examined distributional differences and compared TrAdaBoost.R2, Two-Stage TrAdaBoost.R2, and instance-weighted kernel ridge regression (IWKRR) against a target-only AdaBoost.R2 baseline. SHAP was used to interpret model predictions.

## Findings

IWKRR performed best among the evaluated methods. The paper reports **R² = 0.876**, **RMSE = 6.89 kPa**, and **MAE = 5.46 kPa**. Density and moisture content were the dominant predictors in the SHAP analysis. These are reported study results, not evidence of universal performance across soil types or new sites.

## Scope and limitations

The evidence comes from a particular source–target comparison. Applying it elsewhere requires checking the new data, measurement compatibility, and validation design. SHAP explains model behavior; it does not establish causal relationships. The public scripts currently require separately supplied data and environment setup, so they should be treated as research code rather than a ready-to-use engineering tool.

## Outputs

- [Published article](https://doi.org/10.1016/j.geogeo.2026.100519): *Transfer learning for undrained shear strength prediction: A case study with instance-based transfer*.
- [Public Python repository](https://github.com/raiedahmed-lab/TL_USS_Prediction), including attribution to the original algorithm implementations.

[← All research]({{ '/research/' | relative_url }})
