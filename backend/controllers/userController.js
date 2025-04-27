// backend/controllers/userController.js
const { admin } = require('../config/firebase');
const db = admin.firestore();

// User collection reference
const usersRef = db.collection('users');

// Get user profile by ID
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.uid;
    
    // Get user data from Firestore
    const userDoc = await usersRef.doc(userId).get();
    
    if (!userDoc.exists) {
      // If user document doesn't exist in Firestore but user exists in Auth
      // Create a new user profile document
      if (userId === req.user.uid) {
        const userAuth = await admin.auth().getUser(userId);
        
        const userData = {
          uid: userAuth.uid,
          email: userAuth.email,
          displayName: userAuth.displayName || '',
          photoURL: userAuth.photoURL || '',
          bio: '',
          location: '',
          joinedDate: userAuth.metadata.creationTime,
          socialLinks: {},
          preferences: {
            notificationsEnabled: true,
            privacySettings: 'public'
          },
          stats: {
            tripsCount: 0,
            storiesCount: 0,
            followersCount: 0,
            followingCount: 0
          }
        };
        
        await usersRef.doc(userId).set(userData);
        
        return res.status(200).json({
          success: true,
          data: userData
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }
    
    // Return user data
    const userData = userDoc.data();
    
    // Remove sensitive information if not the user themselves
    if (userId !== req.user?.uid) {
      delete userData.email;
      delete userData.preferences;
      // Add any other fields that should be private
    }
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const updateData = req.body;
    
    // Filter out fields that shouldn't be updated directly
    const { uid, email, stats, joinedDate, ...allowedUpdates } = updateData;
    
    // Update user document
    await usersRef.doc(userId).update({
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    });
    
    // Get updated user data
    const updatedUserDoc = await usersRef.doc(userId).get();
    
    res.status(200).json({
      success: true,
      data: updatedUserDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

// Follow a user
const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.uid;
    const followingId = req.params.id;
    
    // Check if users are different
    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }
    
    // Check if following user exists
    const followingUser = await usersRef.doc(followingId).get();
    if (!followingUser.exists) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found'
      });
    }
    
    // Add to followers collection of following user
    await db.collection('followers').doc(`${followingId}_${followerId}`).set({
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    });
    
    // Update stats
    const batch = db.batch();
    
    // Update follower's following count
    const followerRef = usersRef.doc(followerId);
    batch.update(followerRef, {
      'stats.followingCount': admin.firestore.FieldValue.increment(1)
    });
    
    // Update following's followers count
    const followingRef = usersRef.doc(followingId);
    batch.update(followingRef, {
      'stats.followersCount': admin.firestore.FieldValue.increment(1)
    });
    
    await batch.commit();
    
    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Unfollow a user
const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.uid;
    const followingId = req.params.id;
    
    // Delete from followers collection
    await db.collection('followers').doc(`${followingId}_${followerId}`).delete();
    
    // Update stats
    const batch = db.batch();
    
    // Update follower's following count
    const followerRef = usersRef.doc(followerId);
    batch.update(followerRef, {
      'stats.followingCount': admin.firestore.FieldValue.increment(-1)
    });
    
    // Update following's followers count
    const followingRef = usersRef.doc(followingId);
    batch.update(followingRef, {
      'stats.followersCount': admin.firestore.FieldValue.increment(-1)
    });
    
    await batch.commit();
    
    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user followers
const getUserFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const followersSnapshot = await db.collection('followers')
      .where('followingId', '==', userId)
      .get();
    
    const followerIds = followersSnapshot.docs.map(doc => doc.data().followerId);
    
    // Get user details for each follower
    const followers = [];
    
    if (followerIds.length > 0) {
      const followerDocs = await Promise.all(
        followerIds.map(id => usersRef.doc(id).get())
      );
      
      for (const doc of followerDocs) {
        if (doc.exists) {
          const userData = doc.data();
          followers.push({
            uid: userData.uid,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            bio: userData.bio
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: followers
    });
  } catch (error) {
    next(error);
  }
};

// Get users followed by a user
const getUserFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const followingSnapshot = await db.collection('followers')
      .where('followerId', '==', userId)
      .get();
    
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    
    // Get user details for each following
    const following = [];
    
    if (followingIds.length > 0) {
      const followingDocs = await Promise.all(
        followingIds.map(id => usersRef.doc(id).get())
      );
      
      for (const doc of followingDocs) {
        if (doc.exists) {
          const userData = doc.data();
          following.push({
            uid: userData.uid,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            bio: userData.bio
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: following
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
};