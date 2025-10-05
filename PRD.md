⚽ Product Requirements Document (PRD)
Project Name: Football Results Expectations
1. 📘 Overview

Description:
This web application allows users to predict the results of football matches for selected leagues (starting with the English Premier League and Spanish La Liga). Users can submit their expectations for each week’s matches, and the system automatically scores predictions based on actual match results.

The application supports both mobile and desktop views (responsive design) and includes a full Admin Dashboard to control leagues, matches, users, and prediction time windows.

2. 🎯 Goals and Objectives

Provide an interactive and easy-to-use web app for predicting football match results.

Allow users to compete through a global leaderboard that updates after every game.

Enable the admin to manage leagues, teams, matches, and control prediction periods.

Build the system with a scalable architecture using Node.js, Express, Next.js, React, and PostgreSQL.

3. 👥 Target Users

User: Football fans who want to predict weekly results and compete with others.

Admin: Platform owner who manages leagues, matches, users, and scoring schedules.

4. ⚙️ Features
4.1 User Features

Register and log in using email/password.

Predict the exact result for each match (Home score / Away score).

View weekly fixtures and submit predictions before the deadline (4 hours before first match).

View personal points and global leaderboard.

Edit predictions before the closing time.

Responsive design for web and mobile.

4.2 Admin Features

Full control panel for managing:

Leagues (create/edit/delete)

Teams (create/edit/delete)

Matches (create/edit/delete and assign to a league/week)

Users (view, edit, deactivate)

Set prediction deadlines per league or game week.

Update final match results to calculate user scores.

View statistics (total users, most active, points distribution).

5. 🧮 Scoring System
Condition	Points
Correct team to win	2 points
Correct draw	2 points
Correct total number of goals	+1 point
Correct goals for either team	+1 point
Correct total result (exact score)	+3 points total

📝 Example:
Prediction: Team A 2–1 Team B
Result: Team A 2–1 Team B → 3 points (total correct).
Result: Team A 3–2 Team B → 1 point (total goals correct).

6. 📅 Prediction Rules

Predictions open once the game week fixtures are published.

All predictions for that week close 4 hours before the first match starts.

After that, users cannot edit or submit new predictions.

7. 🧭 Leaderboard

The global leaderboard updates automatically after each game ends.

Rankings are based on total points.

Supports filters by: league, week, and all-time.

Admin can reset leaderboard data if needed.

8. 💻 Technical Stack
Layer	Technology
Frontend	Next.js, React, shadcn/ui (for UI components), Tailwind CSS
Backend	Node.js, Express.js
Database	PostgreSQL (with Prisma ORM optional)
Authentication	JWT (email/password), later Google/Facebook OAuth
Hosting (future)	Vercel or Render
Architecture	REST API + SSR via Next.js
9. 🧱 Database Design (Conceptual Overview)

Tables:

users (id, name, email, password_hash, role, total_points)

leagues (id, name, country, active)

teams (id, name, league_id)

matches (id, league_id, home_team_id, away_team_id, date, home_score, away_score, week_number, status)

predictions (id, user_id, match_id, home_pred, away_pred, points_awarded)

settings (id, league_id, prediction_deadline)

10. 📡 API Endpoints (Examples)
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/leagues	List all leagues
POST	/api/predictions	Submit or edit user predictions
GET	/api/leaderboard	Get leaderboard data
POST	/api/admin/leagues	Create league (admin)
POST	/api/admin/matches	Add match (admin)
PATCH	/api/admin/results	Update match result and recalculate points
11. 🎨 UI/UX Requirements

Responsive design (mobile + web).

Dark and light mode switch.

Simple navigation bar (Home, My Predictions, Leaderboard, Profile).

Admin Dashboard sidebar (Leagues, Teams, Matches, Users, Settings).

Clear notification when predictions close.

12. 🔐 Security & Privacy

Use JWT for session management.

Hash passwords with bcrypt.

Validate all input data.

Admin-only access protected by middleware.

13. 🚀 Roadmap / Milestones
Phase	Description	Duration
Phase 1	Project setup (Next.js, Express.js, DB schema, Auth)	2 weeks
Phase 2	User prediction module + points calculation	3 weeks
Phase 3	Admin panel + league/team/match management	3 weeks
Phase 4	Leaderboard + responsive UI	2 weeks
Phase 5	Testing, optimization, and local deployment	2 weeks
Phase 6	Public deployment + OAuth login	Future update
14. 🧭 Future Enhancements

Multi-language support (Arabic, German).

API integration for live match data.

User levels or badges.

Notifications (email or in-app).

Mobile app version (React Native).