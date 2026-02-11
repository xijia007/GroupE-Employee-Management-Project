// backend/middleware/validationMiddleware.js
import { z } from 'zod';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // ZodError should have 'errors' or 'issues'
      const issues = error.errors || error.issues || [];
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: issues.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
        details: error.flatten ? error.flatten().fieldErrors : {}, 
      });
    }
    next(error);
  }
};
