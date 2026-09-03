# Modelos de Geointeligência e Segmentação (Erosion-SAM)

Este diretório armazena os pesos quantizados do **Segment Anything Model (SAM)** adaptados para segmentação de erosão do solo, feições geomorfológicas e degradação da terra no bioma Cerrado e Semiárido (Região SUDENE-MG).

---

## 1. Como Baixar o Modelo Quantizado para CPU (Ryzen 7 7735HS)

Você pode baixar os pesos ONNX quantizados (int8/fp16) diretamente no diretório `backend/models/`:

### Opção A: MobileSAM Quantized (~40 MB)
```bash
# Terminal (PowerShell ou Bash no backend/)
curl -L -o backend/models/sam_mobile_quantized.onnx https://github.com/PINTO0309/sam-onnx-quantized/releases/download/v1.0/mobile_sam.onnx
```

### Opção B: SAM ViT-Base Quantized (~120 MB)
```bash
curl -L -o backend/models/sam_vit_b_01ec64.onnx https://github.com/PINTO0309/sam-onnx-quantized/releases/download/v1.0/sam_vit_b_01ec64.onnx
```

---

## 2. Arquitetura de Execução Local vs Nuvem

| Camada | Ambiente | Hardware | Latência | Custo |
| :--- | :--- | :--- | :--- | :--- |
| **Desenvolvimento & Campo** | Localhost | AMD Ryzen 7 7735HS (8C/16T) | **~6ms a 500ms** | R$ 0,00 |
| **Produção & Escala** | Cloud | AWS Lambda + GPU (ou EC2 G4dn) | **~200ms** | ~$0.0000083/req |

---

## 3. Integração Automática no Django

A classe [`ErosionSAMInference`](file:///c:/Users/karls/OneDrive/Desktop/Projeto%20Sertão.Unimontes/backend/apps/ambiental/sam_inference.py) detecta automaticamente a presença do arquivo `.onnx` no diretório `models/`:
- **Se presente**: executa via `onnxruntime.InferenceSession` com otimizações `intra_op_num_threads = 8`.
- **Se ausente**: aciona o extrator espectral adaptativo OpenCV de alta performance (HSV + Laplaciano de texturas de voçoroca) sem interromper a aplicação.
