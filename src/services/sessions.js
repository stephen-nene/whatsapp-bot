import db from "../../models/index.js";
import { Op } from 'sequelize';

class SessionManager {
  constructor() {
    this.User = db.User;
    this.Session = db.Session;
    this.TestResult = db.TestResult;
  }

  /**
   * Find users with optional filtering and including related models
   * @param {Object} [filter={}] - Optional filtering conditions
   * @param {Object} [options={}] - Additional query options
   * @returns {Promise<Array>} Array of users
   */
  async findUsers(filter = {}, options = {}) {
    return await this.User.findAll({
      where: filter,
      ...options,
      include: options.include || [
        {
          model: db.TestResult,
          as: 'TestResults'
        }
      ]
    });
  }

  /**
   * Find test results with optional filtering and including related models
   * @param {Object} [filter={}] - Optional filtering conditions
   * @param {Object} [options={}] - Additional query options
   * @returns {Promise<Array>} Array of test results
   */
  async findTestResults(filter = {}, options = {}) {
    return await this.TestResult.findAll({
      where: filter,
      ...options,
      include: options.include || [
        {
          model: db.User,
          attributes: ["id", "full_name", "email"],
        }
      ]
    });
  }

  /**
   * Initialize a new session for a user
   * @param {Object} userData - User data to create or find user
   * @param {string} initialState - Initial session state
   * @returns {Promise<Session>} Created or found session
   */
  async initializeSession(userData, initialState = 'AWAITING_REGISTRATION') {
    try {
      // Find or create user based on registration number
      const [user, created] = await this.User.findOrCreate({
        where: { registration_number: userData.registration_number },
        defaults: userData
      });

      // Create a new session
      const session = await this.Session.create({
        user_id: user.id,
        session_state: initialState
      });

      return session;
    } catch (error) {
      console.error('Session initialization failed:', error);
      throw new Error('Failed to initialize session');
    }
  }

  /**
   * Update session state for a user
   * @param {number} userId - ID of the user
   * @param {string} newState - New session state
   * @returns {Promise<Session>} Updated session
   */
  async updateSessionState(userId, newState) {
    try {
      const [updatedRowsCount, [updatedSession]] = await this.Session.update(
        { session_state: newState },
        { 
          where: { 
            user_id: userId,
            session_state: { [Op.ne]: newState } 
          },
          returning: true 
        }
      );

      if (updatedRowsCount === 0) {
        throw new Error('No session updated');
      }

      return updatedSession;
    } catch (error) {
      console.error('Session state update failed:', error);
      throw new Error('Failed to update session state');
    }
  }

  /**
   * Get current session for a user
   * @param {number} userId - ID of the user
   * @returns {Promise<Session|null>} Current active session
   */
  async getCurrentSession(userId) {
    return await this.Session.findOne({
      where: { 
        user_id: userId 
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Clean up old or expired sessions
   * @param {number} daysOld - Number of days to consider a session expired
   */
  async cleanupExpiredSessions(daysOld = 7) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - daysOld);

    await this.Session.destroy({
      where: {
        createdAt: {
          [Op.lt]: expirationDate
        }
      }
    });
  }

  /**
   * Advanced user search with multiple criteria
   * @param {Object} searchCriteria - Search parameters
   * @returns {Promise<Array>} Matching users
   */
  async searchUsers(searchCriteria) {
    const { 
      name, 
      email, 
      registrationNumber, 
      minTestScore, 
      membershipLevel 
    } = searchCriteria;

    const whereConditions = {};

    if (name) {
      whereConditions.full_name = {
        [Op.like]: `%${name}%`
      };
    }

    if (email) {
      whereConditions.email = {
        [Op.like]: `%${email}%`
      };
    }

    if (registrationNumber) {
      whereConditions.registration_number = registrationNumber;
    }

    return await this.User.findAll({
      where: whereConditions,
      include: [
        {
          model: db.TestResult,
          where: minTestScore ? {
            score: {
              [Op.gte]: minTestScore
            }
          } : {},
          required: !!minTestScore
        }
      ]
    });
  }
}

// Predefined session states
SessionManager.STATES = {
  AWAITING_REGISTRATION: 'AWAITING_REGISTRATION',
  PROCESSING_PAYMENT: 'PROCESSING_PAYMENT',
  PAYMENT_DONE: 'PAYMENT_DONE',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED'
};

export default SessionManager;