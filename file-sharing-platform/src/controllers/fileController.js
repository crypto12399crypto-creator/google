const { File, User, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

exports.uploadFile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ message: req.t('files.noFileUploaded') });
    }

    const { originalname, path: stored_path, size: file_size } = req.file;
    let hashedPassword = null;
    if (req.body.password) {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    const fileRecord = await File.create({
      user_id: req.user.id,
      original_name: originalname,
      stored_path: stored_path,
      file_size: file_size,
      is_admin_file: req.user.is_admin,
      password: hashedPassword,
      expires_at: req.body.expires_at || null
    }, { transaction: t });

    await User.increment('used_storage', { by: file_size, where: { id: req.user.id }, transaction: t });
    await t.commit();

    res.status(201).json({
      status: 'success',
      message: req.t('files.uploadSuccess'),
      data: {
        file: fileRecord,
        downloadLink: `${req.protocol}://${req.get('host')}/api/v1/files/download/${fileRecord.link_token}`
      },
    });
  } catch (error) {
    await t.rollback();
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if(err) console.error("Error deleting orphaned file:", err);
      });
    }
    res.status(500).json({ status: 'error', message: error.message, error: error });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.findAll({ where: { user_id: req.user.id }, order: [['createdAt', 'DESC']] });
    res.status(200).json({
      status: 'success',
      results: files.length,
      data: { files },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: req.t('files.fetchFailed'), error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const file = await File.findOne({ where: { id: req.params.id, user_id: req.user.id }, transaction: t });

    if (!file) {
      await t.rollback();
      return res.status(404).json({ message: req.t('files.notFound') });
    }

    fs.unlink(file.stored_path, (err) => {
        if (err) console.error("Could not delete physical file, but proceeding with DB record deletion:", err);
    });

    await User.decrement('used_storage', { by: file.file_size, where: { id: req.user.id }, transaction: t });
    await file.destroy({ transaction: t });
    await t.commit();

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: req.t('files.deleteFailed'), error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findOne({ where: { link_token: req.params.token } });

        if (!file) {
            return res.status(404).json({ message: req.t('files.notFound') });
        }

        if (file.expires_at && new Date(file.expires_at) < new Date()) {
            return res.status(403).json({ message: req.t('files.linkExpired') });
        }

        if (file.password) {
            const { password } = req.body;
            if (!password || !(await bcrypt.compare(password, file.password))) {
                return res.status(401).json({ message: req.t('files.passwordRequired') });
            }
        }

        await file.increment('download_count');

        res.download(file.stored_path, file.original_name, (err) => {
            if(err) {
                if (!res.headersSent) {
                    res.status(500).json({ message: req.t('files.downloadFailed') });
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: req.t('files.downloadFailed'), error: error.message });
    }
};
