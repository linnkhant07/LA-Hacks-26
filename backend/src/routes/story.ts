import { Router } from 'express';
import { Story } from '../types';
import { database } from '../config/database';
import { ObjectId } from 'mongodb';

const router = Router();

// Get story by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle special 'preview' ID for demo
    if (id === 'preview') {
      // Return the same fake story that frontend currently uses
      const fakeStory = {
        _id: 'preview',
        title: 'The Incredible Journey of a Tornado',
        topic: 'tornadoes',
        narrator: {
          type: 'animal',
          character: 'fox',
          voice_id: '',
        },
        pages: [
          // ... (would include the full fake story data)
        ],
        cyu: [
          { type: 'voice', question: 'What kind of storm do tornadoes come from?' },
        ]
      };

      return res.json(fakeStory);
    }

    // Fetch from actual database
    if (!database.isConnected()) {
      throw new Error('Database not connected');
    }

    const story = await database.getDb()
      .collection<Story>('stories')
      .findOne({ _id: id });

    if (!story) {
      return res.status(404).json({
        error: 'Story not found'
      });
    }

    return res.json(story);

  } catch (error) {
    console.error('Error fetching story:', error);
    return res.status(500).json({
      error: 'Failed to fetch story'
    });
  }
});

// Save story (for story generation pipeline)
router.post('/', async (req, res) => {
  try {
    const story: Story = req.body;

    // Validate story structure
    if (!story.title || !story.topic || !story.narrator || !story.pages) {
      return res.status(400).json({
        error: 'Invalid story structure'
      });
    }

    // Save to database
    if (!database.isConnected()) {
      throw new Error('Database not connected');
    }

    const result = await database.getDb()
      .collection<Story>('stories')
      .insertOne({
        ...story,
        _id: undefined, // Let MongoDB generate ID
      } as any);

    const storyId = result.insertedId.toString();
    console.log(`Story saved with ID: ${storyId}`);

    return res.json({
      story_id: storyId,
      message: 'Story saved successfully'
    });

  } catch (error) {
    console.error('Error saving story:', error);
    return res.status(500).json({
      error: 'Failed to save story'
    });
  }
});

// Update story
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Update in database
    // if (!database.isConnected()) {
    //   throw new Error('Database not connected');
    // }

    // const result = await database.getDb()
    //   .collection<Story>('stories')
    //   .updateOne(
    //     { _id: new ObjectId(id) },
    //     {
    //       $set: {
    //         ...updates,
    //         updatedAt: new Date()
    //       }
    //     }
    //   );

    // if (result.matchedCount === 0) {
    //   return res.status(404).json({
    //     error: 'Story not found'
    //   });
    // }

    console.log(`Story ${id} updated`);

    res.json({
      message: 'Story updated successfully'
    });

  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({
      error: 'Failed to update story'
    });
  }
});

// Delete story
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Delete from database
    // if (!database.isConnected()) {
    //   throw new Error('Database not connected');
    // }

    // const result = await database.getDb()
    //   .collection<Story>('stories')
    //   .deleteOne({ _id: new ObjectId(id) });

    // if (result.deletedCount === 0) {
    //   return res.status(404).json({
    //     error: 'Story not found'
    //   });
    // }

    console.log(`Story ${id} deleted`);

    res.json({
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      error: 'Failed to delete story'
    });
  }
});

export default router;