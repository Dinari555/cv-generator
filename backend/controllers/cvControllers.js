const CV = require('../models/cvschema');
const { generateCVPdf } = require("../service/pdfService");

exports.creationcv = async (req, res) => {
    try{
        const cv = new CV(req.body);
        await cv.save();
        res.status(201).json({ message: 'creation reussie', data: cv });
    }
    catch(error){
        res.status(500).json({ message: 'erreur de creation' })
    }
};

exports.getcv = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ message: "CV introuvable" });
    }
    res.status(200).json(cv);
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération" });
  }
};

 exports.getallcvs = async (req , res) =>{
    try{
        const cv = await CV.find();
        res.status(200).json(cv);
    }
    catch(error){
        res.status(500).json({ message: 'erreur de recuperation' });
    }
 };

exports.deletecv = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ message: 'CV introuvable' });
    }
    await cv.deleteOne();
    res.status(200).json({ message: 'suppression reussie' });
  } catch (error) {
    res.status(500).json({ message: 'erreur de suppression' });
  }
};

exports.updatecv = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ message: "CV introuvable" });
    }

    cv.set(req.body);
    await cv.save();

    res.status(200).json({ message: "Modification réussie", data: cv });
  } catch (error) {
    res.status(500).json({ message: "Erreur de modification" });
  }
};

exports.exportCV = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);

    if (!cv) {
      return res.status(404).json({ message: "CV introuvable" });
    }

    generateCVPdf(cv, res);

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'export du CV" });
  }
};

exports.previewCV = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ message: 'CV introuvable' });
    // Stream inline for preview in browser
    generateCVPdf(cv, res, { inline: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'aperçu du CV" });
  }
};
