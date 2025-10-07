const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be at most 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  height: {
    value: {
      type: Number,
      validate: {
        validator: function(value) {
          if (!value) return true;
          if (this.unit === 'cm') {
            return value >= 50 && value <= 300;
          } else if (this.unit === 'ft') {
            return value >= 1.5 && value <= 10;
          }
          return true;
        },
        message: function(props) {
          if (this.unit === 'cm') {
            return 'Height must be between 50 and 300 cm';
          } else if (this.unit === 'ft') {
            return 'Height must be between 1.5 and 10 feet';
          }
          return 'Invalid height value';
        }
      }
    },
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [20, 'Weight must be at least 20kg'],
      max: [500, 'Weight must be at most 500kg']
    },
    unit: {
      type: String,
      enum: ['kg'],
      default: 'kg'
    }
  },
  fitnessGoal: {
    type: String,
    enum: [
      'weight_loss',
      'weight_gain', 
      'muscle_building',
      'endurance',
      'general_fitness',
      'strength_training',
      'cardio_fitness',
      'flexibility',
      'maintenance'
    ]
  },
  profilePicture: {
    url: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      message: 'Age must be between 13 and 120 years'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for height in different units
profileSchema.virtual('heightInCm').get(function() {
  if (!this.height || !this.height.value) return null;
  
  if (this.height.unit === 'cm') {
    return this.height.value;
  } else if (this.height.unit === 'ft') {
    // Convert feet to cm (1 ft = 30.48 cm)
    return Math.round(this.height.value * 30.48);
  }
  return null;
});

profileSchema.virtual('heightInFt').get(function() {
  if (!this.height || !this.height.value) return null;
  
  if (this.height.unit === 'ft') {
    return this.height.value;
  } else if (this.height.unit === 'cm') {
    // Convert cm to feet (1 cm = 0.0328084 ft)
    return Math.round((this.height.value * 0.0328084) * 100) / 100;
  }
  return null;
});

// Virtual for BMI calculation
profileSchema.virtual('bmi').get(function() {
  if (!this.height || !this.weight || !this.height.value || !this.weight.value) {
    return null;
  }
  
  const heightInM = this.heightInCm / 100;
  const weightInKg = this.weight.value;
  
  if (heightInM && weightInKg) {
    const bmi = weightInKg / (heightInM * heightInM);
    return Math.round(bmi * 10) / 10;
  }
  return null;
});

// Virtual for BMI category
profileSchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

// Ensure virtual fields are serialized
profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

// Index for better query performance
profileSchema.index({ user: 1 });
profileSchema.index({ fitnessGoal: 1 });
profileSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Profile', profileSchema);
