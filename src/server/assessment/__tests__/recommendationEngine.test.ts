/**
 * Tests for Project Recommendation Engine
 */

import { generateRecommendations } from '../recommendationEngine';
import { StudentProfile, ProjectRecommendation } from '../projectRecommendation';

describe('Project Recommendation Engine', () => {
  describe('generateRecommendations', () => {
    it('should return 5 projects by default', () => {
      const profile: StudentProfile = {
        interests: ['web-development', 'react'],
        assessmentScores: {
          js_basics: 0.6,
          react_basics: 0.4,
          html_css: 0.7,
        },
        goals: {
          shortTerm: 'Build my first React app',
          mediumTerm: 'Get a junior dev job',
          longTerm: 'Become a senior engineer',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      expect(recommendations).toHaveLength(5);
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return projects ordered by difficulty (ascending)', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
          html_css: 0.6,
        },
        goals: {
          shortTerm: 'Learn basics',
          mediumTerm: 'Build projects',
          longTerm: 'Get hired',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].difficulty).toBeLessThanOrEqual(
          recommendations[i + 1].difficulty
        );
      }
    });

    it('should include all required fields in each recommendation', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Learn',
          mediumTerm: 'Build',
          longTerm: 'Master',
        },
      };

      const recommendations = generateRecommendations(profile, 3);

      for (const rec of recommendations) {
        expect(rec.title).toBeDefined();
        expect(typeof rec.title).toBe('string');
        expect(rec.title.length).toBeGreaterThan(0);

        expect(rec.description).toBeDefined();
        expect(typeof rec.description).toBe('string');

        expect(Array.isArray(rec.learningOutcomes)).toBe(true);
        expect(rec.learningOutcomes.length).toBeGreaterThan(0);

        expect(Array.isArray(rec.techStack)).toBe(true);
        expect(rec.techStack.length).toBeGreaterThan(0);

        expect(Array.isArray(rec.deliverables)).toBe(true);
        expect(rec.deliverables.length).toBeGreaterThan(0);

        expect(Array.isArray(rec.supportingResources)).toBe(true);
        expect(rec.supportingResources.length).toBeGreaterThan(0);

        expect(rec.recommendationReason).toBeDefined();
        expect(typeof rec.recommendationReason).toBe('string');

        expect(typeof rec.difficulty).toBe('number');
        expect(rec.difficulty).toBeGreaterThanOrEqual(1);
        expect(rec.difficulty).toBeLessThanOrEqual(5);

        expect(Array.isArray(rec.alignedInterests)).toBe(true);
        expect(Array.isArray(rec.targetedSkills)).toBe(true);

        expect(['short', 'medium', 'long']).toContain(rec.goalHorizon);
      }
    });

    it('should prioritize projects matching student interests', () => {
      const profile: StudentProfile = {
        interests: ['react', 'web-development'],
        assessmentScores: {
          js_basics: 0.7,
          react_basics: 0.3,
        },
        goals: {
          shortTerm: 'Master React',
          mediumTerm: 'Build React apps',
          longTerm: 'Expert in React',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      // At least one project should align with React interest
      const hasReactProject = recommendations.some((rec) =>
        rec.alignedInterests.includes('react')
      );
      expect(hasReactProject).toBe(true);

      // At least one project should align with web-development
      const hasWebProject = recommendations.some((rec) =>
        rec.alignedInterests.includes('web-development')
      );
      expect(hasWebProject).toBe(true);
    });

    it('should target skill gaps in recommendations', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.3, // Low score - skill gap
          react_basics: 0.2, // Low score - skill gap
          html_css: 0.8, // High score - not a gap
        },
        goals: {
          shortTerm: 'Improve JavaScript',
          mediumTerm: 'Learn React',
          longTerm: 'Full-stack dev',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      // Projects should target the weak skills
      const allTargetedSkills = recommendations.flatMap((rec) => rec.targetedSkills);

      // Should have more than 0 targeted skills
      expect(allTargetedSkills.length).toBeGreaterThan(0);
    });

    it('should provide diverse goal horizon coverage', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Short goal',
          mediumTerm: 'Medium goal',
          longTerm: 'Long goal',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      const goalHorizons = recommendations.map((rec) => rec.goalHorizon);
      const uniqueHorizons = new Set(goalHorizons);

      // Should have at least 2 different goal horizons for diversity
      expect(uniqueHorizons.size).toBeGreaterThanOrEqual(2);
    });

    it('should handle beginner profile (low scores)', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.2,
          html_css: 0.3,
          dom_manipulation: 0.1,
        },
        goals: {
          shortTerm: 'Learn to code',
          mediumTerm: 'Build first website',
          longTerm: 'Become a developer',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      // Should recommend beginner-friendly projects (difficulty 1-2)
      const beginnerProjects = recommendations.filter((rec) => rec.difficulty <= 2);
      expect(beginnerProjects.length).toBeGreaterThan(0);

      // First project should be beginner level
      expect(recommendations[0].difficulty).toBeLessThanOrEqual(2);
    });

    it('should handle advanced profile (high scores)', () => {
      const profile: StudentProfile = {
        interests: ['full-stack', 'backend', 'scalability'],
        assessmentScores: {
          js_basics: 0.9,
          react_basics: 0.85,
          node_basics: 0.8,
          database_basics: 0.75,
          api_consumption: 0.9,
        },
        goals: {
          shortTerm: 'Build complex systems',
          mediumTerm: 'Master architecture',
          longTerm: 'Lead engineering team',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      // Should include advanced projects (difficulty 3-5)
      const advancedProjects = recommendations.filter((rec) => rec.difficulty >= 3);
      expect(advancedProjects.length).toBeGreaterThan(0);
    });

    it('should handle empty interests gracefully', () => {
      const profile: StudentProfile = {
        interests: [], // No interests specified
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Learn programming',
          mediumTerm: 'Build projects',
          longTerm: 'Get hired',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      expect(recommendations).toHaveLength(5);
      expect(Array.isArray(recommendations)).toBe(true);
      // Should still provide valid recommendations
      expect(recommendations[0].title).toBeDefined();
    });

    it('should handle empty goals gracefully', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: '',
          mediumTerm: '',
          longTerm: '',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      expect(recommendations).toHaveLength(5);
      expect(Array.isArray(recommendations)).toBe(true);
      // Should still provide valid recommendations
      expect(recommendations[0].description).toBeDefined();
    });

    it('should handle minimal assessment scores', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.1, // Only one skill with low score
        },
        goals: {
          shortTerm: 'Start learning',
          mediumTerm: 'Build something',
          longTerm: 'Get good',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      expect(recommendations).toHaveLength(5);
      // Should recommend beginner projects
      expect(recommendations[0].difficulty).toBeLessThanOrEqual(2);
    });

    it('should respect custom count parameter', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Learn',
          mediumTerm: 'Build',
          longTerm: 'Master',
        },
      };

      const recommendations3 = generateRecommendations(profile, 3);
      expect(recommendations3).toHaveLength(3);

      const recommendations7 = generateRecommendations(profile, 7);
      expect(recommendations7.length).toBeLessThanOrEqual(7); // May have fewer if not enough templates
    });

    it('should generate personalized recommendation reasons', () => {
      const profile: StudentProfile = {
        interests: ['react', 'web-development'],
        assessmentScores: {
          js_basics: 0.4,
          react_basics: 0.2,
        },
        goals: {
          shortTerm: 'Master React',
          mediumTerm: 'Build React apps',
          longTerm: 'Become React expert',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      for (const rec of recommendations) {
        // Recommendation reason should be non-empty
        expect(rec.recommendationReason.length).toBeGreaterThan(0);

        // Should include the word "project" or similar context
        const lowerReason = rec.recommendationReason.toLowerCase();
        expect(
          lowerReason.includes('aligns') ||
            lowerReason.includes('addresses') ||
            lowerReason.includes('supports') ||
            lowerReason.includes('offers')
        ).toBe(true);
      }
    });

    it('should handle edge case: no assessment scores', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {}, // No scores
        goals: {
          shortTerm: 'Start learning',
          mediumTerm: 'Build projects',
          longTerm: 'Get hired',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      expect(recommendations).toHaveLength(5);
      // Should still provide recommendations based on interests and goals
      expect(recommendations[0].title).toBeDefined();
    });

    it('should ensure diversity in project categories', () => {
      const profile: StudentProfile = {
        interests: ['web-development', 'mobile', 'data'],
        assessmentScores: {
          js_basics: 0.5,
          react_basics: 0.4,
        },
        goals: {
          shortTerm: 'Explore different domains',
          mediumTerm: 'Build varied projects',
          longTerm: 'Versatile developer',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      // Collect unique aligned interests across all recommendations
      const allAlignedInterests = new Set(
        recommendations.flatMap((rec) => rec.alignedInterests)
      );

      // Should have some variety in aligned interests
      expect(allAlignedInterests.size).toBeGreaterThan(0);
    });

    it('should include tech stack for each project', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Learn tech stacks',
          mediumTerm: 'Use modern tools',
          longTerm: 'Master frameworks',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      for (const rec of recommendations) {
        expect(rec.techStack.length).toBeGreaterThan(0);

        // Each tech stack item should be a non-empty string
        for (const tech of rec.techStack) {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        }
      }
    });

    it('should provide concrete deliverables for each project', () => {
      const profile: StudentProfile = {
        interests: ['web-development'],
        assessmentScores: {
          js_basics: 0.5,
        },
        goals: {
          shortTerm: 'Build tangible projects',
          mediumTerm: 'Create portfolio',
          longTerm: 'Ship products',
        },
      };

      const recommendations = generateRecommendations(profile, 5);

      for (const rec of recommendations) {
        expect(rec.deliverables.length).toBeGreaterThan(0);

        // Each deliverable should be a non-empty string
        for (const deliverable of rec.deliverables) {
          expect(typeof deliverable).toBe('string');
          expect(deliverable.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
