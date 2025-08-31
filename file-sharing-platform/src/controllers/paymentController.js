const { CryptoPaymentRequest, Plan, User } = require('../models');
const crypto = require('crypto');

const getCryptoPrice = async (cryptoType, usdAmount) => {
  if (cryptoType === 'BTC') return usdAmount / 50000;
  if (cryptoType === 'ETH') return usdAmount / 3000;
  throw new Error('Unsupported cryptocurrency type');
};

const generateNewWalletAddress = (cryptoType) => {
  const randomString = crypto.randomBytes(20).toString('hex');
  if (cryptoType === 'BTC') return `bc1q${randomString.slice(0, 38)}`;
  if (cryptoType === 'ETH') return `0x${randomString}`;
  return randomString;
};

exports.requestPayment = async (req, res) => {
  try {
    const { planId, cryptoType } = req.body;
    const userId = req.user.id;

    if (!planId || !cryptoType) {
        return res.status(400).json({ message: req.t('payments.planAndCryptoRequired', 'planId and cryptoType are required.') });
    }

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: req.t('payments.planNotFound') });
    }

    const existingRequest = await CryptoPaymentRequest.findOne({
      where: { user_id: userId, status: 'pending' },
    });

    if (existingRequest) {
      return res.status(200).json({
        status: 'success',
        message: req.t('payments.pendingRequestExists'),
        data: { paymentRequest: existingRequest },
      });
    }

    const address = generateNewWalletAddress(cryptoType);
    const expected_amount_crypto = await getCryptoPrice(cryptoType, plan.price_usd);

    const paymentRequest = await CryptoPaymentRequest.create({
      user_id: userId,
      plan_id: planId,
      address,
      expected_amount_crypto: parseFloat(expected_amount_crypto.toFixed(8)),
      crypto_type: cryptoType,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      message: req.t('payments.requestSuccess'),
      data: { paymentRequest },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.t('payments.requestFailed'),
      error: error.message,
    });
  }
};
