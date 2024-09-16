// services/virtualTryOnService.js
const axios = require('axios');
const Queue = require('bull');
const app = require('../server');
const { TryOnJob, User, Product } = require('../models');


const tryOnQueue = new Queue('virtualTryOn', process.env.REDIS_URL);

class VirtualTryOnService {
  constructor(io) {
    this.io = io;
  }

  async queueTryOnJob(userId, imageBuffer, productId) {
    const job = await tryOnQueue.add({
      userId,
      productId,
      imageBuffer: imageBuffer.toString('base64')
    });

    await TryOnJob.create({
      job_id: job.id,
      UserId: userId,
      ProductId: productId,
      status: 'queued',
    });

    this.emitJobUpdate(userId, tryOnJob);
    return job.id;
  }

  async getTryOnStatus(jobId) {
    const tryOnJob = await TryOnJob.findByPk(jobId, {
      include: [User, Product],
    });

    if (!tryOnJob) {
      throw new Error('Job not found');
    }

    return {
      id: tryOnJob.job_id,
      status: tryOnJob.status,
      result: tryOnJob.result_url,
      user: tryOnJob.User,
      product: tryOnJob.Product,
    };
  }

  async updateJobStatus(jobId, status, resultUrl = null) {
    const tryOnJob = await TryOnJob.findByPk(jobId);
    if (!tryOnJob) {
      throw new Error('Job not found');
    }

    tryOnJob.status = status;
    tryOnJob.result_url = resultUrl;
    await tryOnJob.save();

    this.emitJobUpdate(tryOnJob.UserId, tryOnJob);
  }

  emitJobUpdate(userId, job) {
    this.io.to(`user-${userId}`).emit('jobUpdate', {
      jobId: job.job_id,
      status: job.status,
      resultUrl: job.result_url
    });
  }

}

// Job processor
tryOnQueue.process(async (job) => {
  const { userId, productId, imageBuffer } = job.data;
  
  try {
    await VirtualTryOnService.updateJobStatus(job.id, 'processing');

    const response = await axios.post(`${process.env.PYTHON_SERVICE_URL}/try-on`, {
      userId,
      productId,
      image: imageBuffer
    });

    await VirtualTryOnService.updateJobStatus(job.id, 'completed', response.data.result);

    return response.data;
  } catch (error) {
    console.error('Error processing try-on job:', error);
    await VirtualTryOnService.updateJobStatus(job.id, 'failed');
    throw error;
  }
});

module.exports = new VirtualTryOnService();
