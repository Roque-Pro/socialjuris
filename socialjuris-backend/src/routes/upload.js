const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuração do Multer (Onde salvar e nome do arquivo)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Nome único: timestamp-nomeoriginal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ========= ROTA DE UPLOAD ========= //
router.post('/', upload.single('arquivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }
    
    // Retorna a URL pública do arquivo
    // Em produção, isso seria uma URL do S3/Supabase Storage
    const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    
    res.json({ 
      ok: true, 
      url: fileUrl, 
      filename: req.file.originalname,
      type: req.file.mimetype 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no upload" });
  }
});

module.exports = router;
