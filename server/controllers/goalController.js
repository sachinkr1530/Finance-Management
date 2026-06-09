const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

exports.createGoal = async (req, res) => {
  try {
    const { title, category, targetAmount, savedAmount, deadline, description, icon, color, priority, monthlyTarget, autoSave, autoSaveAmount } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      title,
      category,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline,
      description,
      icon: icon || '🎯',
      color: color || '#6366f1',
      priority: priority || 'medium',
      monthlyTarget: monthlyTarget || Math.ceil((targetAmount - (savedAmount || 0)) / 12),
      autoSave: autoSave || false,
      autoSaveAmount: autoSaveAmount || 0
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const goals = await Goal.find(filter).sort({ priority: -1, deadline: 1 });

    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    res.json({
      success: true,
      goals,
      summary: {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        totalSaved,
        totalTarget,
        overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updateData = req.body;

    // Check if goal just completed
    if (updateData.savedAmount && updateData.savedAmount >= goal.targetAmount && goal.status !== 'completed') {
      updateData.status = 'completed';
      await Notification.create({
        user: req.user._id,
        type: 'goal_completed',
        title: `🎉 Goal Completed: ${goal.title}`,
        message: `Congratulations! You've achieved your goal of ₹${goal.targetAmount.toLocaleString()} for ${goal.title}!`,
        priority: 'high',
        icon: '🎯'
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json({ success: true, goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSavingsToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + amount);

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
      await Notification.create({
        user: req.user._id,
        type: 'goal_completed',
        title: `🎉 Goal Completed: ${goal.title}`,
        message: `Congratulations! You've achieved your goal of ₹${goal.targetAmount.toLocaleString()} for ${goal.title}!`,
        priority: 'high',
        icon: '🎯'
      });
    }

    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
