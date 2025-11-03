--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."UserFavoriteTeam" DROP CONSTRAINT IF EXISTS "UserFavoriteTeam_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserFavoriteTeam" DROP CONSTRAINT IF EXISTS "UserFavoriteTeam_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_achievementId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeamLeague" DROP CONSTRAINT IF EXISTS "TeamLeague_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeamLeague" DROP CONSTRAINT IF EXISTS "TeamLeague_leagueId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeamGameWeekStats" DROP CONSTRAINT IF EXISTS "TeamGameWeekStats_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeamGameWeekStats" DROP CONSTRAINT IF EXISTS "TeamGameWeekStats_gameWeekId_fkey";
ALTER TABLE IF EXISTS ONLY public."Table" DROP CONSTRAINT IF EXISTS "Table_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."Table" DROP CONSTRAINT IF EXISTS "Table_nextOpponentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Table" DROP CONSTRAINT IF EXISTS "Table_leagueId_fkey";
ALTER TABLE IF EXISTS ONLY public."TableSnapshot" DROP CONSTRAINT IF EXISTS "TableSnapshot_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."TableSnapshot" DROP CONSTRAINT IF EXISTS "TableSnapshot_gameWeekId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prediction" DROP CONSTRAINT IF EXISTS "Prediction_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prediction" DROP CONSTRAINT IF EXISTS "Prediction_matchId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Match" DROP CONSTRAINT IF EXISTS "Match_leagueId_fkey";
ALTER TABLE IF EXISTS ONLY public."Match" DROP CONSTRAINT IF EXISTS "Match_homeTeamId_fkey";
ALTER TABLE IF EXISTS ONLY public."Match" DROP CONSTRAINT IF EXISTS "Match_awayTeamId_fkey";
ALTER TABLE IF EXISTS ONLY public."LoginHistory" DROP CONSTRAINT IF EXISTS "LoginHistory_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Group" DROP CONSTRAINT IF EXISTS "Group_ownerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Group" DROP CONSTRAINT IF EXISTS "Group_leagueId_fkey";
ALTER TABLE IF EXISTS ONLY public."GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_groupId_fkey";
ALTER TABLE IF EXISTS ONLY public."GroupChangeRequest" DROP CONSTRAINT IF EXISTS "GroupChangeRequest_requestedById_fkey";
ALTER TABLE IF EXISTS ONLY public."GroupChangeRequest" DROP CONSTRAINT IF EXISTS "GroupChangeRequest_groupId_fkey";
ALTER TABLE IF EXISTS ONLY public."GameWeek" DROP CONSTRAINT IF EXISTS "GameWeek_leagueId_fkey";
ALTER TABLE IF EXISTS ONLY public."GameWeekMatch" DROP CONSTRAINT IF EXISTS "GameWeekMatch_matchId_fkey";
ALTER TABLE IF EXISTS ONLY public."GameWeekMatch" DROP CONSTRAINT IF EXISTS "GameWeekMatch_gameWeekId_fkey";
DROP INDEX IF EXISTS public."User_username_key";
DROP INDEX IF EXISTS public."User_totalPoints_idx";
DROP INDEX IF EXISTS public."User_resetPasswordToken_key";
DROP INDEX IF EXISTS public."User_rank_idx";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."User_email_idx";
DROP INDEX IF EXISTS public."User_emailVerifyToken_key";
DROP INDEX IF EXISTS public."UserFavoriteTeam_userId_teamId_key";
DROP INDEX IF EXISTS public."UserFavoriteTeam_userId_idx";
DROP INDEX IF EXISTS public."UserFavoriteTeam_teamId_idx";
DROP INDEX IF EXISTS public."UserAchievement_userId_idx";
DROP INDEX IF EXISTS public."UserAchievement_userId_achievementId_key";
DROP INDEX IF EXISTS public."Team_code_key";
DROP INDEX IF EXISTS public."Team_code_idx";
DROP INDEX IF EXISTS public."TeamLeague_teamId_leagueId_key";
DROP INDEX IF EXISTS public."TeamLeague_teamId_idx";
DROP INDEX IF EXISTS public."TeamLeague_leagueId_idx";
DROP INDEX IF EXISTS public."TeamLeague_isActive_idx";
DROP INDEX IF EXISTS public."TeamGameWeekStats_teamId_idx";
DROP INDEX IF EXISTS public."TeamGameWeekStats_gameWeekId_teamId_key";
DROP INDEX IF EXISTS public."TeamGameWeekStats_gameWeekId_idx";
DROP INDEX IF EXISTS public."Table_leagueId_teamId_key";
DROP INDEX IF EXISTS public."Table_leagueId_position_idx";
DROP INDEX IF EXISTS public."TableSnapshot_teamId_idx";
DROP INDEX IF EXISTS public."TableSnapshot_gameWeekId_teamId_key";
DROP INDEX IF EXISTS public."TableSnapshot_gameWeekId_position_idx";
DROP INDEX IF EXISTS public."Session_userId_idx";
DROP INDEX IF EXISTS public."Session_token_key";
DROP INDEX IF EXISTS public."Session_token_idx";
DROP INDEX IF EXISTS public."Prediction_userId_matchId_key";
DROP INDEX IF EXISTS public."Prediction_userId_idx";
DROP INDEX IF EXISTS public."Prediction_matchId_idx";
DROP INDEX IF EXISTS public."Prediction_isProcessed_idx";
DROP INDEX IF EXISTS public."PointsRule_isActive_idx";
DROP INDEX IF EXISTS public."Notification_userId_isRead_idx";
DROP INDEX IF EXISTS public."Notification_createdAt_idx";
DROP INDEX IF EXISTS public."Match_weekNumber_idx";
DROP INDEX IF EXISTS public."Match_status_idx";
DROP INDEX IF EXISTS public."Match_matchDate_idx";
DROP INDEX IF EXISTS public."Match_leagueId_idx";
DROP INDEX IF EXISTS public."Match_homeTeamId_awayTeamId_matchDate_key";
DROP INDEX IF EXISTS public."LoginHistory_userId_idx";
DROP INDEX IF EXISTS public."LoginHistory_createdAt_idx";
DROP INDEX IF EXISTS public."League_season_idx";
DROP INDEX IF EXISTS public."League_name_season_key";
DROP INDEX IF EXISTS public."League_isActive_idx";
DROP INDEX IF EXISTS public."League_code_key";
DROP INDEX IF EXISTS public."Group_leagueId_idx";
DROP INDEX IF EXISTS public."Group_joinCode_key";
DROP INDEX IF EXISTS public."Group_joinCode_idx";
DROP INDEX IF EXISTS public."Group_isPublic_idx";
DROP INDEX IF EXISTS public."Group_code_key";
DROP INDEX IF EXISTS public."Group_code_idx";
DROP INDEX IF EXISTS public."GroupMember_userId_idx";
DROP INDEX IF EXISTS public."GroupMember_groupId_userId_key";
DROP INDEX IF EXISTS public."GroupMember_groupId_idx";
DROP INDEX IF EXISTS public."GroupChangeRequest_status_idx";
DROP INDEX IF EXISTS public."GroupChangeRequest_requestedById_idx";
DROP INDEX IF EXISTS public."GroupChangeRequest_groupId_idx";
DROP INDEX IF EXISTS public."GameWeek_leagueId_weekNumber_key";
DROP INDEX IF EXISTS public."GameWeek_leagueId_weekNumber_idx";
DROP INDEX IF EXISTS public."GameWeek_isCurrent_idx";
DROP INDEX IF EXISTS public."GameWeekMatch_matchId_idx";
DROP INDEX IF EXISTS public."GameWeekMatch_gameWeekId_matchId_key";
DROP INDEX IF EXISTS public."GameWeekMatch_gameWeekId_idx";
DROP INDEX IF EXISTS public."AuditLog_userId_idx";
DROP INDEX IF EXISTS public."AuditLog_entity_entityId_idx";
DROP INDEX IF EXISTS public."AuditLog_createdAt_idx";
DROP INDEX IF EXISTS public."AppSettings_key_key";
DROP INDEX IF EXISTS public."AppSettings_key_idx";
DROP INDEX IF EXISTS public."Analytics_date_key";
DROP INDEX IF EXISTS public."Analytics_date_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserFavoriteTeam" DROP CONSTRAINT IF EXISTS "UserFavoriteTeam_pkey";
ALTER TABLE IF EXISTS ONLY public."UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_pkey";
ALTER TABLE IF EXISTS ONLY public."Team" DROP CONSTRAINT IF EXISTS "Team_pkey";
ALTER TABLE IF EXISTS ONLY public."TeamLeague" DROP CONSTRAINT IF EXISTS "TeamLeague_pkey";
ALTER TABLE IF EXISTS ONLY public."TeamGameWeekStats" DROP CONSTRAINT IF EXISTS "TeamGameWeekStats_pkey";
ALTER TABLE IF EXISTS ONLY public."Table" DROP CONSTRAINT IF EXISTS "Table_pkey";
ALTER TABLE IF EXISTS ONLY public."TableSnapshot" DROP CONSTRAINT IF EXISTS "TableSnapshot_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."Prediction" DROP CONSTRAINT IF EXISTS "Prediction_pkey";
ALTER TABLE IF EXISTS ONLY public."PointsRule" DROP CONSTRAINT IF EXISTS "PointsRule_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."Match" DROP CONSTRAINT IF EXISTS "Match_pkey";
ALTER TABLE IF EXISTS ONLY public."LoginHistory" DROP CONSTRAINT IF EXISTS "LoginHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."League" DROP CONSTRAINT IF EXISTS "League_pkey";
ALTER TABLE IF EXISTS ONLY public."Group" DROP CONSTRAINT IF EXISTS "Group_pkey";
ALTER TABLE IF EXISTS ONLY public."GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_pkey";
ALTER TABLE IF EXISTS ONLY public."GroupChangeRequest" DROP CONSTRAINT IF EXISTS "GroupChangeRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."GameWeek" DROP CONSTRAINT IF EXISTS "GameWeek_pkey";
ALTER TABLE IF EXISTS ONLY public."GameWeekMatch" DROP CONSTRAINT IF EXISTS "GameWeekMatch_pkey";
ALTER TABLE IF EXISTS ONLY public."Badge" DROP CONSTRAINT IF EXISTS "Badge_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY public."AppSettings" DROP CONSTRAINT IF EXISTS "AppSettings_pkey";
ALTER TABLE IF EXISTS ONLY public."Analytics" DROP CONSTRAINT IF EXISTS "Analytics_pkey";
ALTER TABLE IF EXISTS ONLY public."Achievement" DROP CONSTRAINT IF EXISTS "Achievement_pkey";
ALTER TABLE IF EXISTS public."UserFavoriteTeam" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."UserAchievement" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."User" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TeamLeague" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TeamGameWeekStats" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Team" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TableSnapshot" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Table" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Prediction" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."PointsRule" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Notification" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Match" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."LoginHistory" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."League" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."GroupMember" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."GroupChangeRequest" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Group" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."GameWeekMatch" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."GameWeek" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Badge" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."AuditLog" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."AppSettings" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Analytics" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Achievement" ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP SEQUENCE IF EXISTS public."User_id_seq";
DROP SEQUENCE IF EXISTS public."UserFavoriteTeam_id_seq";
DROP TABLE IF EXISTS public."UserFavoriteTeam";
DROP SEQUENCE IF EXISTS public."UserAchievement_id_seq";
DROP TABLE IF EXISTS public."UserAchievement";
DROP TABLE IF EXISTS public."User";
DROP SEQUENCE IF EXISTS public."Team_id_seq";
DROP SEQUENCE IF EXISTS public."TeamLeague_id_seq";
DROP TABLE IF EXISTS public."TeamLeague";
DROP SEQUENCE IF EXISTS public."TeamGameWeekStats_id_seq";
DROP TABLE IF EXISTS public."TeamGameWeekStats";
DROP TABLE IF EXISTS public."Team";
DROP SEQUENCE IF EXISTS public."Table_id_seq";
DROP SEQUENCE IF EXISTS public."TableSnapshot_id_seq";
DROP TABLE IF EXISTS public."TableSnapshot";
DROP TABLE IF EXISTS public."Table";
DROP TABLE IF EXISTS public."Session";
DROP SEQUENCE IF EXISTS public."Prediction_id_seq";
DROP TABLE IF EXISTS public."Prediction";
DROP SEQUENCE IF EXISTS public."PointsRule_id_seq";
DROP TABLE IF EXISTS public."PointsRule";
DROP SEQUENCE IF EXISTS public."Notification_id_seq";
DROP TABLE IF EXISTS public."Notification";
DROP SEQUENCE IF EXISTS public."Match_id_seq";
DROP TABLE IF EXISTS public."Match";
DROP SEQUENCE IF EXISTS public."LoginHistory_id_seq";
DROP TABLE IF EXISTS public."LoginHistory";
DROP SEQUENCE IF EXISTS public."League_id_seq";
DROP TABLE IF EXISTS public."League";
DROP SEQUENCE IF EXISTS public."Group_id_seq";
DROP SEQUENCE IF EXISTS public."GroupMember_id_seq";
DROP TABLE IF EXISTS public."GroupMember";
DROP SEQUENCE IF EXISTS public."GroupChangeRequest_id_seq";
DROP TABLE IF EXISTS public."GroupChangeRequest";
DROP TABLE IF EXISTS public."Group";
DROP SEQUENCE IF EXISTS public."GameWeek_id_seq";
DROP SEQUENCE IF EXISTS public."GameWeekMatch_id_seq";
DROP TABLE IF EXISTS public."GameWeekMatch";
DROP TABLE IF EXISTS public."GameWeek";
DROP SEQUENCE IF EXISTS public."Badge_id_seq";
DROP TABLE IF EXISTS public."Badge";
DROP SEQUENCE IF EXISTS public."AuditLog_id_seq";
DROP TABLE IF EXISTS public."AuditLog";
DROP SEQUENCE IF EXISTS public."AppSettings_id_seq";
DROP TABLE IF EXISTS public."AppSettings";
DROP SEQUENCE IF EXISTS public."Analytics_id_seq";
DROP TABLE IF EXISTS public."Analytics";
DROP SEQUENCE IF EXISTS public."Achievement_id_seq";
DROP TABLE IF EXISTS public."Achievement";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."Result";
DROP TYPE IF EXISTS public."PredictionStatus";
DROP TYPE IF EXISTS public."PointsType";
DROP TYPE IF EXISTS public."NotificationType";
DROP TYPE IF EXISTS public."MatchStatus";
DROP TYPE IF EXISTS public."GroupRole";
DROP TYPE IF EXISTS public."GroupChangeType";
DROP TYPE IF EXISTS public."GameWeekStatus";
DROP TYPE IF EXISTS public."ChangeRequestStatus";
DROP TYPE IF EXISTS public."BadgeTier";
DROP TYPE IF EXISTS public."AchievementCategory";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AchievementCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AchievementCategory" AS ENUM (
    'PREDICTIONS',
    'ACCURACY',
    'STREAKS',
    'POINTS',
    'SOCIAL',
    'SPECIAL'
);


--
-- Name: BadgeTier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BadgeTier" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND'
);


--
-- Name: ChangeRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ChangeRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: GameWeekStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GameWeekStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'POSTPONED'
);


--
-- Name: GroupChangeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GroupChangeType" AS ENUM (
    'LEAGUE_CHANGE',
    'TEAM_SELECTION_CHANGE',
    'CROSS_LEAGUE_TOGGLE'
);


--
-- Name: GroupRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GroupRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER'
);


--
-- Name: MatchStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchStatus" AS ENUM (
    'SCHEDULED',
    'LIVE',
    'HALF_TIME',
    'FINISHED',
    'POSTPONED',
    'CANCELED',
    'ABANDONED'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'MATCH_REMINDER',
    'PREDICTION_DEADLINE',
    'MATCH_RESULT',
    'POINTS_EARNED',
    'ACHIEVEMENT_UNLOCKED',
    'GROUP_INVITATION',
    'LEADERBOARD_UPDATE',
    'SYSTEM_ANNOUNCEMENT'
);


--
-- Name: PointsType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PointsType" AS ENUM (
    'EXACT_SCORE',
    'CORRECT_RESULT',
    'GOAL_DIFFERENCE',
    'ONE_TEAM_SCORE',
    'TOTAL_GOALS',
    'BOTH_TEAMS_SCORE',
    'CLEAN_SHEET',
    'HIGH_SCORING',
    'UNDERDOG_WIN',
    'WEEKLY_STREAK',
    'PERFECT_WEEK',
    'EXACT_HOME_SCORE',
    'EXACT_AWAY_SCORE',
    'CORRECT_TOTAL_GOALS',
    'EXACT_SCORE_BONUS',
    'CORRECT_GOAL_DIFFERENCE'
);


--
-- Name: PredictionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PredictionStatus" AS ENUM (
    'NOT_PLAYED_YET',
    'IN_PROGRESS',
    'COMPLETED',
    'SYNCED'
);


--
-- Name: Result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Result" AS ENUM (
    'WIN_HOME',
    'WIN_AWAY',
    'DRAW'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'USER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Achievement" (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "iconUrl" text,
    category public."AchievementCategory" NOT NULL,
    "requiredValue" integer,
    points integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Achievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Achievement_id_seq" OWNED BY public."Achievement".id;


--
-- Name: Analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Analytics" (
    id integer NOT NULL,
    date date NOT NULL,
    "totalUsers" integer DEFAULT 0 NOT NULL,
    "activeUsers" integer DEFAULT 0 NOT NULL,
    "newUsers" integer DEFAULT 0 NOT NULL,
    "totalPredictions" integer DEFAULT 0 NOT NULL,
    "avgPredictionsPerUser" double precision DEFAULT 0 NOT NULL,
    "mostPredictedMatch" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Analytics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Analytics_id_seq" OWNED BY public."Analytics".id;


--
-- Name: AppSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AppSettings" (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AppSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AppSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AppSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AppSettings_id_seq" OWNED BY public."AppSettings".id;


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id integer NOT NULL,
    "userId" integer,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" integer,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AuditLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AuditLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AuditLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AuditLog_id_seq" OWNED BY public."AuditLog".id;


--
-- Name: Badge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Badge" (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "imageUrl" text NOT NULL,
    tier public."BadgeTier" NOT NULL,
    requirement jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Badge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Badge_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Badge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Badge_id_seq" OWNED BY public."Badge".id;


--
-- Name: GameWeek; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GameWeek" (
    id integer NOT NULL,
    "leagueId" integer NOT NULL,
    "weekNumber" integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status public."GameWeekStatus" DEFAULT 'SCHEDULED'::public."GameWeekStatus" NOT NULL,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: GameWeekMatch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GameWeekMatch" (
    id integer NOT NULL,
    "gameWeekId" integer NOT NULL,
    "matchId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isSynced" boolean DEFAULT false NOT NULL
);


--
-- Name: GameWeekMatch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GameWeekMatch_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GameWeekMatch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GameWeekMatch_id_seq" OWNED BY public."GameWeekMatch".id;


--
-- Name: GameWeek_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GameWeek_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GameWeek_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GameWeek_id_seq" OWNED BY public."GameWeek".id;


--
-- Name: Group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Group" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    code text NOT NULL,
    "isPrivate" boolean DEFAULT false NOT NULL,
    "joinCode" text,
    "maxMembers" integer DEFAULT 50 NOT NULL,
    "ownerId" integer NOT NULL,
    "logoUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "leagueId" integer,
    "allowedTeamIds" integer[]
);


--
-- Name: GroupChangeRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GroupChangeRequest" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    "requestedById" integer NOT NULL,
    "reviewedBy" integer,
    "changeType" public."GroupChangeType" NOT NULL,
    "currentValue" jsonb,
    "requestedValue" jsonb NOT NULL,
    reason text,
    status public."ChangeRequestStatus" DEFAULT 'PENDING'::public."ChangeRequestStatus" NOT NULL,
    "reviewNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone
);


--
-- Name: GroupChangeRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GroupChangeRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GroupChangeRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GroupChangeRequest_id_seq" OWNED BY public."GroupChangeRequest".id;


--
-- Name: GroupMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GroupMember" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    "userId" integer NOT NULL,
    role public."GroupRole" DEFAULT 'MEMBER'::public."GroupRole" NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pointsByLeague" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "lastUpdated" timestamp(3) without time zone NOT NULL,
    "pointsByGameweek" jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: GroupMember_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GroupMember_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GroupMember_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GroupMember_id_seq" OWNED BY public."GroupMember".id;


--
-- Name: Group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Group_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Group_id_seq" OWNED BY public."Group".id;


--
-- Name: League; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."League" (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    country text,
    "logoUrl" text,
    season text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: League_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."League_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: League_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."League_id_seq" OWNED BY public."League".id;


--
-- Name: LoginHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoginHistory" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "ipAddress" text NOT NULL,
    "userAgent" text,
    "loginStatus" boolean NOT NULL,
    "failReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LoginHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LoginHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LoginHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LoginHistory_id_seq" OWNED BY public."LoginHistory".id;


--
-- Name: Match; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Match" (
    id integer NOT NULL,
    "leagueId" integer NOT NULL,
    "homeTeamId" integer NOT NULL,
    "awayTeamId" integer NOT NULL,
    "matchDate" timestamp(3) without time zone NOT NULL,
    "weekNumber" integer,
    "homeScore" integer,
    "awayScore" integer,
    status public."MatchStatus" DEFAULT 'SCHEDULED'::public."MatchStatus" NOT NULL,
    "isPredictionLocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isPostponed" boolean DEFAULT false NOT NULL,
    "originalWeekNumber" integer,
    "isSynced" boolean DEFAULT false NOT NULL
);


--
-- Name: Match_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Match_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Match_id_seq" OWNED BY public."Match".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: PointsRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PointsRule" (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    points integer NOT NULL,
    type public."PointsType" NOT NULL,
    condition jsonb,
    priority integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PointsRule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PointsRule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PointsRule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PointsRule_id_seq" OWNED BY public."PointsRule".id;


--
-- Name: Prediction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Prediction" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "matchId" integer NOT NULL,
    "predictedHomeScore" integer NOT NULL,
    "predictedAwayScore" integer NOT NULL,
    "predictedResult" public."Result",
    confidence integer DEFAULT 50,
    "resultPoints" integer DEFAULT 0 NOT NULL,
    "scorePoints" integer DEFAULT 0 NOT NULL,
    "bonusPoints" integer DEFAULT 0 NOT NULL,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "isProcessed" boolean DEFAULT false NOT NULL,
    "isLate" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."PredictionStatus" DEFAULT 'NOT_PLAYED_YET'::public."PredictionStatus" NOT NULL
);


--
-- Name: Prediction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Prediction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Prediction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Prediction_id_seq" OWNED BY public."Prediction".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Table" (
    id integer NOT NULL,
    "leagueId" integer NOT NULL,
    "teamId" integer NOT NULL,
    "position" integer NOT NULL,
    played integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    "goalsFor" integer DEFAULT 0 NOT NULL,
    "goalsAgainst" integer DEFAULT 0 NOT NULL,
    "goalDifference" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    form text,
    "nextOpponentId" integer,
    "lastUpdatedGameWeek" integer,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TableSnapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TableSnapshot" (
    id integer NOT NULL,
    "gameWeekId" integer NOT NULL,
    "teamId" integer NOT NULL,
    "position" integer NOT NULL,
    played integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    "goalsFor" integer DEFAULT 0 NOT NULL,
    "goalsAgainst" integer DEFAULT 0 NOT NULL,
    "goalDifference" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    form text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TableSnapshot_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TableSnapshot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TableSnapshot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TableSnapshot_id_seq" OWNED BY public."TableSnapshot".id;


--
-- Name: Table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Table_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Table_id_seq" OWNED BY public."Table".id;


--
-- Name: Team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Team" (
    id integer NOT NULL,
    name text NOT NULL,
    "shortName" text,
    code text NOT NULL,
    "logoUrl" text,
    "stadiumName" text,
    "foundedYear" integer,
    website text,
    "primaryColor" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "apiName" text
);


--
-- Name: TeamGameWeekStats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamGameWeekStats" (
    id integer NOT NULL,
    "gameWeekId" integer NOT NULL,
    "teamId" integer NOT NULL,
    "matchesPlayed" integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    "goalsFor" integer DEFAULT 0 NOT NULL,
    "goalsAgainst" integer DEFAULT 0 NOT NULL,
    "goalDifference" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    result text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TeamGameWeekStats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TeamGameWeekStats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TeamGameWeekStats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TeamGameWeekStats_id_seq" OWNED BY public."TeamGameWeekStats".id;


--
-- Name: TeamLeague; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamLeague" (
    id integer NOT NULL,
    "teamId" integer NOT NULL,
    "leagueId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TeamLeague_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TeamLeague_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TeamLeague_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TeamLeague_id_seq" OWNED BY public."TeamLeague".id;


--
-- Name: Team_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Team_id_seq" OWNED BY public."Team".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    username text,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifyToken" text,
    "resetPasswordToken" text,
    "resetPasswordExpiry" timestamp(3) without time zone,
    avatar text,
    bio text,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "weeklyPoints" integer DEFAULT 0 NOT NULL,
    "monthlyPoints" integer DEFAULT 0 NOT NULL,
    "seasonPoints" integer DEFAULT 0 NOT NULL,
    "predictionAccuracy" double precision DEFAULT 0 NOT NULL,
    "totalPredictions" integer DEFAULT 0 NOT NULL,
    "correctPredictions" integer DEFAULT 0 NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "bestStreak" integer DEFAULT 0 NOT NULL,
    rank integer,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserAchievement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserAchievement" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "achievementId" integer NOT NULL,
    "unlockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    progress integer DEFAULT 0 NOT NULL
);


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserAchievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserAchievement_id_seq" OWNED BY public."UserAchievement".id;


--
-- Name: UserFavoriteTeam; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserFavoriteTeam" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "teamId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserFavoriteTeam_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserFavoriteTeam_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserFavoriteTeam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserFavoriteTeam_id_seq" OWNED BY public."UserFavoriteTeam".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: Achievement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Achievement" ALTER COLUMN id SET DEFAULT nextval('public."Achievement_id_seq"'::regclass);


--
-- Name: Analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Analytics" ALTER COLUMN id SET DEFAULT nextval('public."Analytics_id_seq"'::regclass);


--
-- Name: AppSettings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AppSettings" ALTER COLUMN id SET DEFAULT nextval('public."AppSettings_id_seq"'::regclass);


--
-- Name: AuditLog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog" ALTER COLUMN id SET DEFAULT nextval('public."AuditLog_id_seq"'::regclass);


--
-- Name: Badge id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Badge" ALTER COLUMN id SET DEFAULT nextval('public."Badge_id_seq"'::regclass);


--
-- Name: GameWeek id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeek" ALTER COLUMN id SET DEFAULT nextval('public."GameWeek_id_seq"'::regclass);


--
-- Name: GameWeekMatch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeekMatch" ALTER COLUMN id SET DEFAULT nextval('public."GameWeekMatch_id_seq"'::regclass);


--
-- Name: Group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Group" ALTER COLUMN id SET DEFAULT nextval('public."Group_id_seq"'::regclass);


--
-- Name: GroupChangeRequest id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChangeRequest" ALTER COLUMN id SET DEFAULT nextval('public."GroupChangeRequest_id_seq"'::regclass);


--
-- Name: GroupMember id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupMember" ALTER COLUMN id SET DEFAULT nextval('public."GroupMember_id_seq"'::regclass);


--
-- Name: League id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."League" ALTER COLUMN id SET DEFAULT nextval('public."League_id_seq"'::regclass);


--
-- Name: LoginHistory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginHistory" ALTER COLUMN id SET DEFAULT nextval('public."LoginHistory_id_seq"'::regclass);


--
-- Name: Match id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Match" ALTER COLUMN id SET DEFAULT nextval('public."Match_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: PointsRule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PointsRule" ALTER COLUMN id SET DEFAULT nextval('public."PointsRule_id_seq"'::regclass);


--
-- Name: Prediction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prediction" ALTER COLUMN id SET DEFAULT nextval('public."Prediction_id_seq"'::regclass);


--
-- Name: Table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table" ALTER COLUMN id SET DEFAULT nextval('public."Table_id_seq"'::regclass);


--
-- Name: TableSnapshot id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSnapshot" ALTER COLUMN id SET DEFAULT nextval('public."TableSnapshot_id_seq"'::regclass);


--
-- Name: Team id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team" ALTER COLUMN id SET DEFAULT nextval('public."Team_id_seq"'::regclass);


--
-- Name: TeamGameWeekStats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamGameWeekStats" ALTER COLUMN id SET DEFAULT nextval('public."TeamGameWeekStats_id_seq"'::regclass);


--
-- Name: TeamLeague id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamLeague" ALTER COLUMN id SET DEFAULT nextval('public."TeamLeague_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserAchievement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement" ALTER COLUMN id SET DEFAULT nextval('public."UserAchievement_id_seq"'::regclass);


--
-- Name: UserFavoriteTeam id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavoriteTeam" ALTER COLUMN id SET DEFAULT nextval('public."UserFavoriteTeam_id_seq"'::regclass);


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Achievement" (id, name, description, "iconUrl", category, "requiredValue", points, "isActive", "createdAt") FROM stdin;
1	Unstoppable	Get 10 predictions correct in a row	⚡	STREAKS	10	300	t	2025-10-06 18:06:58.454
2	Social Butterfly	Join 5 different groups	🦋	SOCIAL	5	75	t	2025-10-06 18:06:58.454
3	League Expert	Achieve 80% accuracy in one league	🎓	ACCURACY	80	250	t	2025-10-06 18:06:58.454
4	Community Leader	Create a group with 20+ members	🎖️	SOCIAL	20	200	t	2025-10-06 18:06:58.454
5	First Prediction	Make your first match prediction	🎯	PREDICTIONS	1	10	t	2025-10-06 18:06:58.454
6	Early Bird	Make predictions 24h before match	🐦	SPECIAL	10	100	t	2025-10-06 18:06:58.454
7	Underdog Expert	Correctly predict 5 underdog victories	🐕	SPECIAL	5	180	t	2025-10-06 18:06:58.454
8	Weekend Warrior	Predict all weekend matches correctly	🏅	SPECIAL	\N	250	t	2025-10-06 18:06:58.454
9	Goal Fest	Predict 5 high-scoring matches (4+ goals)	⚽	SPECIAL	5	150	t	2025-10-06 18:06:58.454
10	Point Collector	Earn 500 total points	💰	POINTS	500	50	t	2025-10-06 18:06:58.454
11	Clean Sheet Prophet	Predict 10 clean sheets correctly	🧤	SPECIAL	10	120	t	2025-10-06 18:06:58.454
12	Derby King	Correctly predict 3 derby matches	👑	SPECIAL	3	200	t	2025-10-06 18:06:58.454
13	Sharp Shooter	Achieve 70% prediction accuracy	🎪	ACCURACY	70	150	t	2025-10-06 18:06:58.454
14	Hot Streak	Get 5 predictions correct in a row	🔥	STREAKS	5	100	t	2025-10-06 18:06:58.454
15	Consistency King	Score points in 20 consecutive matches	🔒	STREAKS	20	400	t	2025-10-06 18:06:58.454
16	Point Master	Earn 1000 total points	💎	POINTS	1000	150	t	2025-10-06 18:06:58.454
17	Top of the League	Reach rank #1 in global leaderboard	🥇	POINTS	1	500	t	2025-10-06 18:06:58.454
18	Team Player	Join your first group	👥	SOCIAL	1	25	t	2025-10-06 18:06:58.454
19	Prediction Veteran	Make 50 predictions	📊	PREDICTIONS	50	100	t	2025-10-06 18:06:58.454
20	Perfect Score	Get 5 exact score predictions	💯	ACCURACY	5	200	t	2025-10-06 18:06:58.454
\.


--
-- Data for Name: Analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Analytics" (id, date, "totalUsers", "activeUsers", "newUsers", "totalPredictions", "avgPredictionsPerUser", "mostPredictedMatch", "createdAt") FROM stdin;
1	2025-09-05	5	2	1	19	2.69	\N	2025-10-06 18:06:58.641
2	2025-09-06	5	3	0	18	3.71	\N	2025-10-06 18:06:58.641
3	2025-09-07	5	3	0	18	3.65	\N	2025-10-06 18:06:58.641
4	2025-09-08	5	3	0	21	1.19	\N	2025-10-06 18:06:58.641
5	2025-09-09	5	3	0	11	1.47	\N	2025-10-06 18:06:58.641
6	2025-09-10	5	3	0	19	1.89	\N	2025-10-06 18:06:58.641
7	2025-09-11	5	3	0	9	1.53	\N	2025-10-06 18:06:58.641
8	2025-09-12	5	3	0	22	2.15	\N	2025-10-06 18:06:58.641
9	2025-09-13	5	3	0	18	2.29	\N	2025-10-06 18:06:58.641
10	2025-09-14	5	3	0	19	3.66	\N	2025-10-06 18:06:58.641
11	2025-09-15	5	3	0	24	2	\N	2025-10-06 18:06:58.641
12	2025-09-16	5	4	0	16	1.3	\N	2025-10-06 18:06:58.641
13	2025-09-17	5	4	0	21	3.16	\N	2025-10-06 18:06:58.641
14	2025-09-18	5	4	0	8	3.77	\N	2025-10-06 18:06:58.641
15	2025-09-19	5	4	0	18	1.84	\N	2025-10-06 18:06:58.641
16	2025-09-20	5	4	1	13	2.09	\N	2025-10-06 18:06:58.641
17	2025-09-21	5	4	0	24	3.02	\N	2025-10-06 18:06:58.641
18	2025-09-22	5	4	0	9	3.82	\N	2025-10-06 18:06:58.641
19	2025-09-23	5	4	0	13	2.64	\N	2025-10-06 18:06:58.641
20	2025-09-24	5	4	0	19	3.86	\N	2025-10-06 18:06:58.641
21	2025-09-25	5	4	0	11	2.74	\N	2025-10-06 18:06:58.641
22	2025-09-26	5	5	0	16	3.8	\N	2025-10-06 18:06:58.641
23	2025-09-27	5	5	0	10	1.36	\N	2025-10-06 18:06:58.641
24	2025-09-28	5	5	0	16	2.88	\N	2025-10-06 18:06:58.641
25	2025-09-29	5	5	0	18	2.35	\N	2025-10-06 18:06:58.641
26	2025-09-30	5	5	1	13	2.68	\N	2025-10-06 18:06:58.641
27	2025-10-01	5	5	0	5	2.51	\N	2025-10-06 18:06:58.641
28	2025-10-02	5	5	0	20	1.12	\N	2025-10-06 18:06:58.641
29	2025-10-03	5	5	0	14	3.53	\N	2025-10-06 18:06:58.641
30	2025-10-04	5	5	0	15	2.08	\N	2025-10-06 18:06:58.641
31	2025-10-05	5	5	0	18	1.09	\N	2025-10-06 18:06:58.641
\.


--
-- Data for Name: AppSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AppSettings" (id, key, value, description, "updatedAt", "createdAt") FROM stdin;
1	PREDICTION_DEADLINE_HOURS	2	Hours before match start when predictions are locked	2025-10-18 10:46:59.463	2025-10-12 10:02:52.145
10	FOOTBALL_DATA_API_TOKEN		API token for football-data.org API (Free tier: 12 competitions, 10 calls/minute)	2025-10-24 21:47:16.102	2025-10-24 21:47:16.102
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
1	5	CREATE	Prediction	1	\N	{"matchId": 1, "predictedAwayScore": 1, "predictedHomeScore": 2}	192.168.1.100	\N	2025-10-06 13:06:58.643
2	5	CREATE	Group	1	\N	{"name": "Premier League Fans"}	192.168.1.100	\N	2025-10-05 18:06:58.643
\.


--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Badge" (id, name, description, "imageUrl", tier, requirement, "createdAt") FROM stdin;
\.


--
-- Data for Name: GameWeek; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GameWeek" (id, "leagueId", "weekNumber", "startDate", "endDate", status, "isCurrent", "createdAt", "updatedAt") FROM stdin;
118	4	8	2025-12-07 00:00:00	2025-12-14 00:00:00	COMPLETED	f	2025-10-12 09:28:59.471	2025-10-27 20:58:34.204
85	3	9	2025-10-31 00:00:00	2025-11-02 00:00:00	IN_PROGRESS	t	2025-10-06 18:06:56.654	2025-10-27 20:55:32.389
111	4	1	2025-10-12 00:00:00	2025-10-19 00:00:00	COMPLETED	f	2025-10-12 09:28:59.457	2025-10-27 20:55:18.438
112	4	2	2025-10-20 00:00:00	2025-10-20 00:00:00	COMPLETED	f	2025-10-12 09:28:59.465	2025-10-27 20:55:18.438
19	1	19	2025-12-19 01:00:00	2025-12-25 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.613	2025-10-27 21:11:51.282
20	1	20	2025-12-26 01:00:00	2026-01-01 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.613	2025-10-27 21:11:51.282
21	1	21	2026-01-02 01:00:00	2026-01-08 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.614	2025-10-27 21:11:51.282
22	1	22	2026-01-09 01:00:00	2026-01-15 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.614	2025-10-27 21:11:51.282
113	4	3	2025-10-28 01:00:00	2025-11-04 01:00:00	COMPLETED	f	2025-10-12 09:28:59.466	2025-10-27 20:55:18.438
117	4	7	2025-11-29 01:00:00	2025-12-06 01:00:00	COMPLETED	f	2025-10-12 09:28:59.47	2025-10-27 20:55:18.438
114	4	4	2025-11-05 01:00:00	2025-11-12 01:00:00	COMPLETED	f	2025-10-12 09:28:59.467	2025-10-27 20:55:18.438
120	4	10	2025-12-23 01:00:00	2025-12-30 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.473	2025-10-27 20:55:18.438
121	4	11	2025-12-31 01:00:00	2026-01-07 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.473	2025-10-27 20:55:18.438
122	4	12	2026-01-08 01:00:00	2026-01-15 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.474	2025-10-27 20:55:18.438
115	4	5	2025-11-13 01:00:00	2025-11-20 01:00:00	COMPLETED	f	2025-10-12 09:28:59.468	2025-10-27 20:55:18.438
116	4	6	2025-11-21 01:00:00	2025-11-28 01:00:00	COMPLETED	f	2025-10-12 09:28:59.469	2025-10-27 20:55:18.438
123	4	13	2026-01-16 01:00:00	2026-01-23 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.475	2025-10-27 20:55:18.438
124	4	14	2026-01-24 01:00:00	2026-01-31 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.475	2025-10-27 20:55:18.438
125	4	15	2026-02-01 01:00:00	2026-02-08 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.476	2025-10-27 20:55:18.438
150	5	2	2025-09-30 12:02:00	2025-10-01 12:03:00	COMPLETED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
153	5	7	2025-10-25 12:04:35.743	2025-10-25 12:04:35.743	SCHEDULED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
156	5	6	2025-10-25 12:04:35.743	2025-10-25 12:04:35.743	SCHEDULED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
119	4	9	2025-12-15 00:00:00	2025-12-22 00:00:00	IN_PROGRESS	t	2025-10-12 09:28:59.472	2025-10-27 20:55:18.44
23	1	23	2026-01-16 01:00:00	2026-01-22 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.615	2025-10-27 21:11:51.282
24	1	24	2026-01-23 01:00:00	2026-01-29 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.615	2025-10-27 21:11:51.282
25	1	25	2026-01-30 01:00:00	2026-02-05 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.616	2025-10-27 21:11:51.282
26	1	26	2026-02-06 01:00:00	2026-02-12 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.617	2025-10-27 21:11:51.282
27	1	27	2026-02-13 01:00:00	2026-02-19 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.617	2025-10-27 21:11:51.282
28	1	28	2026-02-20 01:00:00	2026-02-26 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.618	2025-10-27 21:11:51.282
29	1	29	2026-02-27 01:00:00	2026-03-05 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.618	2025-10-27 21:11:51.282
30	1	30	2026-03-06 01:00:00	2026-03-12 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.619	2025-10-27 21:11:51.282
31	1	31	2026-03-13 01:00:00	2026-03-19 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.619	2025-10-27 21:11:51.282
32	1	32	2026-03-20 01:00:00	2026-03-26 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.62	2025-10-27 21:11:51.282
47	2	9	2025-10-17 00:00:00	2025-10-20 00:00:00	COMPLETED	f	2025-10-06 18:06:56.629	2025-10-27 21:51:26.221
40	2	2	2025-08-22 00:00:00	2025-08-25 00:00:00	COMPLETED	f	2025-10-06 18:06:56.625	2025-10-27 21:51:26.221
50	2	12	2025-10-30 01:00:00	2025-11-05 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.631	2025-10-27 21:51:26.221
51	2	13	2025-11-06 01:00:00	2025-11-12 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.632	2025-10-27 21:51:26.221
52	2	14	2025-11-13 01:00:00	2025-11-19 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.632	2025-10-27 21:51:26.221
53	2	15	2025-11-20 01:00:00	2025-11-26 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.633	2025-10-27 21:51:26.221
54	2	16	2025-11-27 01:00:00	2025-12-03 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.633	2025-10-27 21:51:26.221
55	2	17	2025-12-04 01:00:00	2025-12-10 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.634	2025-10-27 21:51:26.221
56	2	18	2025-12-11 01:00:00	2025-12-17 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.635	2025-10-27 21:51:26.221
57	2	19	2025-12-18 01:00:00	2025-12-24 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.636	2025-10-27 21:51:26.221
58	2	20	2025-12-25 01:00:00	2025-12-31 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.637	2025-10-27 21:51:26.221
59	2	21	2026-01-01 01:00:00	2026-01-07 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.638	2025-10-27 21:51:26.221
49	2	11	2025-10-23 00:00:00	2025-10-29 00:00:00	IN_PROGRESS	t	2025-10-06 18:06:56.631	2025-10-27 21:51:26.223
84	3	8	2025-10-24 00:00:00	2025-10-26 00:00:00	COMPLETED	f	2025-10-06 18:06:56.653	2025-10-27 20:55:32.386
86	3	10	2025-11-07 00:00:00	2025-11-09 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.654	2025-10-27 20:55:32.386
83	3	7	2025-10-17 00:00:00	2025-10-19 00:00:00	COMPLETED	f	2025-10-06 18:06:56.652	2025-10-27 20:55:32.386
87	3	11	2025-10-31 01:00:00	2025-11-06 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.655	2025-10-27 20:55:32.386
88	3	12	2025-11-07 01:00:00	2025-11-13 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.655	2025-10-27 20:55:32.386
89	3	13	2025-11-14 01:00:00	2025-11-20 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.656	2025-10-27 20:55:32.386
90	3	14	2025-11-21 01:00:00	2025-11-27 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.657	2025-10-27 20:55:32.386
91	3	15	2025-11-28 01:00:00	2025-12-04 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.657	2025-10-27 20:55:32.386
92	3	16	2025-12-05 01:00:00	2025-12-11 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.658	2025-10-27 20:55:32.386
141	4	31	2026-06-09 00:00:00	2026-06-16 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.487	2025-10-27 20:55:18.438
142	4	32	2026-06-17 00:00:00	2026-06-24 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.487	2025-10-27 20:55:18.438
48	2	10	2025-10-24 00:00:00	2025-10-27 00:00:00	COMPLETED	f	2025-10-06 18:06:56.63	2025-10-27 21:51:26.221
143	4	33	2026-06-25 00:00:00	2026-07-02 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.488	2025-10-27 20:55:18.438
144	4	34	2026-07-03 00:00:00	2026-07-10 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.489	2025-10-27 20:55:18.438
145	4	35	2026-07-11 00:00:00	2026-07-18 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.489	2025-10-27 20:55:18.438
146	4	36	2026-07-19 00:00:00	2026-07-26 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.49	2025-10-27 20:55:18.438
147	4	37	2026-07-27 00:00:00	2026-08-03 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.491	2025-10-27 20:55:18.438
148	4	38	2026-08-04 00:00:00	2026-08-11 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.491	2025-10-27 20:55:18.438
93	3	17	2025-12-12 01:00:00	2025-12-18 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.658	2025-10-27 20:55:32.386
94	3	18	2025-12-19 01:00:00	2025-12-25 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.659	2025-10-27 20:55:32.386
98	3	22	2026-01-16 01:00:00	2026-01-22 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.661	2025-10-27 20:55:32.386
99	3	23	2026-01-23 01:00:00	2026-01-29 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.662	2025-10-27 20:55:32.386
100	3	24	2026-01-30 01:00:00	2026-02-05 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.663	2025-10-27 20:55:32.386
68	2	30	2026-03-05 01:00:00	2026-03-11 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.644	2025-10-27 21:51:26.221
69	2	31	2026-03-12 01:00:00	2026-03-18 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.644	2025-10-27 21:51:26.221
70	2	32	2026-03-19 01:00:00	2026-03-25 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.645	2025-10-27 21:51:26.221
71	2	33	2026-03-26 01:00:00	2026-04-01 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.645	2025-10-27 21:51:26.221
72	2	34	2026-04-02 00:00:00	2026-04-08 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.646	2025-10-27 21:51:26.221
73	2	35	2026-04-09 00:00:00	2026-04-15 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.647	2025-10-27 21:51:26.221
74	2	36	2026-04-16 00:00:00	2026-04-22 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.647	2025-10-27 21:51:26.221
75	2	37	2026-04-23 00:00:00	2026-04-29 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.648	2025-10-27 21:51:26.221
76	2	38	2026-04-30 00:00:00	2026-05-06 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.648	2025-10-27 21:51:26.221
151	5	3	2025-10-21 12:03:00	2025-10-22 12:03:00	COMPLETED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
154	5	5	2025-10-25 12:04:35.743	2025-10-25 12:04:35.743	SCHEDULED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
157	5	1	2025-09-16 12:01:00	2025-09-18 12:02:00	COMPLETED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
101	3	25	2026-02-06 01:00:00	2026-02-12 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.664	2025-10-27 20:55:32.386
102	3	26	2026-02-13 01:00:00	2026-02-19 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.664	2025-10-27 20:55:32.386
41	2	3	2025-08-29 00:00:00	2025-08-31 00:00:00	COMPLETED	f	2025-10-06 18:06:56.626	2025-10-27 21:51:26.221
103	3	27	2026-02-20 01:00:00	2026-02-26 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.665	2025-10-27 20:55:32.386
104	3	28	2026-02-27 01:00:00	2026-03-05 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.665	2025-10-27 20:55:32.386
105	3	29	2026-03-06 01:00:00	2026-03-12 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.666	2025-10-27 20:55:32.386
106	3	30	2026-03-13 01:00:00	2026-03-19 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.666	2025-10-27 20:55:32.386
107	3	31	2026-03-20 01:00:00	2026-03-26 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.667	2025-10-27 20:55:32.386
34	1	34	2026-04-03 00:00:00	2026-04-09 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.621	2025-10-27 21:11:51.282
108	3	32	2026-03-27 01:00:00	2026-04-02 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.668	2025-10-27 20:55:32.386
39	2	1	2025-08-15 00:00:00	2025-08-19 00:00:00	COMPLETED	f	2025-10-06 18:06:56.625	2025-10-27 21:51:26.221
42	2	4	2025-09-12 00:00:00	2025-09-15 00:00:00	COMPLETED	f	2025-10-06 18:06:56.627	2025-10-27 21:51:26.221
43	2	5	2025-09-19 00:00:00	2025-09-21 00:00:00	COMPLETED	f	2025-10-06 18:06:56.627	2025-10-27 21:51:26.221
60	2	22	2026-01-08 01:00:00	2026-01-14 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.638	2025-10-27 21:51:26.221
61	2	23	2026-01-15 01:00:00	2026-01-21 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.639	2025-10-27 21:51:26.221
62	2	24	2026-01-22 01:00:00	2026-01-28 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.64	2025-10-27 21:51:26.221
35	1	35	2026-04-10 00:00:00	2026-04-16 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.622	2025-10-27 21:11:51.282
36	1	36	2026-04-17 00:00:00	2026-04-23 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.623	2025-10-27 21:11:51.282
37	1	37	2026-04-24 00:00:00	2026-04-30 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.624	2025-10-27 21:11:51.282
149	2	999	2025-10-25 12:01:17.403	2025-10-25 12:01:17.403	SCHEDULED	f	2025-10-25 12:01:17.404	2025-10-27 21:51:26.221
63	2	25	2026-01-29 01:00:00	2026-02-04 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.641	2025-10-27 21:51:26.221
64	2	26	2026-02-05 01:00:00	2026-02-11 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.641	2025-10-27 21:51:26.221
65	2	27	2026-02-12 01:00:00	2026-02-18 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.642	2025-10-27 21:51:26.221
66	2	28	2026-02-19 01:00:00	2026-02-25 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.642	2025-10-27 21:51:26.221
67	2	29	2026-02-26 01:00:00	2026-03-04 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.643	2025-10-27 21:51:26.221
38	1	38	2026-05-01 00:00:00	2026-05-07 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.624	2025-10-27 21:11:51.282
1	1	1	2025-08-15 00:00:00	2025-08-18 00:00:00	COMPLETED	f	2025-10-06 18:06:56.599	2025-10-27 21:11:51.282
2	1	2	2025-08-22 00:00:00	2025-08-25 00:00:00	COMPLETED	f	2025-10-06 18:06:56.601	2025-10-27 21:11:51.282
11	1	11	2025-10-24 00:00:00	2025-10-30 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.608	2025-10-27 21:11:51.282
12	1	12	2025-10-31 01:00:00	2025-11-06 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.608	2025-10-27 21:11:51.282
13	1	13	2025-11-07 01:00:00	2025-11-13 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.609	2025-10-27 21:11:51.282
14	1	14	2025-11-14 01:00:00	2025-11-20 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.61	2025-10-27 21:11:51.282
15	1	15	2025-11-21 01:00:00	2025-11-27 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.61	2025-10-27 21:11:51.282
16	1	16	2025-11-28 01:00:00	2025-12-04 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.611	2025-10-27 21:11:51.282
17	1	17	2025-12-05 01:00:00	2025-12-11 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.611	2025-10-27 21:11:51.282
155	5	8	2025-10-25 12:04:35.743	2025-10-25 12:04:35.743	SCHEDULED	f	2025-10-25 12:04:35.745	2025-10-25 12:15:46.067
152	5	4	2025-10-25 00:00:00	2025-10-25 00:00:00	IN_PROGRESS	t	2025-10-25 12:04:35.745	2025-10-25 12:15:46.071
18	1	18	2025-12-12 01:00:00	2025-12-18 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.612	2025-10-27 21:11:51.282
3	1	3	2025-08-30 00:00:00	2025-08-31 00:00:00	COMPLETED	f	2025-10-06 18:06:56.602	2025-10-27 21:11:51.282
4	1	4	2025-09-13 00:00:00	2025-09-14 00:00:00	COMPLETED	f	2025-10-06 18:06:56.603	2025-10-27 21:11:51.282
33	1	33	2026-03-27 01:00:00	2026-04-02 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.621	2025-10-27 21:11:51.282
5	1	5	2025-09-20 00:00:00	2025-09-21 00:00:00	COMPLETED	f	2025-10-06 18:06:56.603	2025-10-27 21:11:51.282
6	1	6	2025-09-27 00:00:00	2025-09-29 00:00:00	COMPLETED	f	2025-10-06 18:06:56.604	2025-10-27 21:11:51.282
7	1	7	2025-10-03 00:00:00	2025-10-05 00:00:00	COMPLETED	f	2025-10-06 18:06:56.605	2025-10-27 21:11:51.282
8	1	8	2025-10-18 00:00:00	2025-10-20 00:00:00	COMPLETED	f	2025-10-06 18:06:56.606	2025-10-27 21:11:51.282
10	1	10	2025-11-01 00:00:00	2025-11-03 00:00:00	IN_PROGRESS	t	2025-10-06 18:06:56.607	2025-10-27 21:11:51.283
9	1	9	2025-10-24 00:00:00	2025-10-26 00:00:00	COMPLETED	f	2025-10-06 18:06:56.607	2025-10-27 21:11:57.13
44	2	6	2025-08-27 00:00:00	2025-09-25 00:00:00	COMPLETED	f	2025-10-06 18:06:56.628	2025-10-27 21:51:26.221
45	2	7	2025-09-26 00:00:00	2025-09-30 00:00:00	COMPLETED	f	2025-10-06 18:06:56.628	2025-10-27 21:51:26.221
46	2	8	2025-10-03 00:00:00	2025-10-05 00:00:00	COMPLETED	f	2025-10-06 18:06:56.629	2025-10-27 21:51:26.221
126	4	16	2026-02-09 01:00:00	2026-02-16 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.477	2025-10-27 20:55:18.438
127	4	17	2026-02-17 01:00:00	2026-02-24 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.477	2025-10-27 20:55:18.438
128	4	18	2026-02-25 01:00:00	2026-03-04 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.478	2025-10-27 20:55:18.438
129	4	19	2026-03-05 01:00:00	2026-03-12 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.479	2025-10-27 20:55:18.438
130	4	20	2026-03-13 01:00:00	2026-03-20 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.479	2025-10-27 20:55:18.438
131	4	21	2026-03-21 01:00:00	2026-03-28 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.48	2025-10-27 20:55:18.438
132	4	22	2026-03-29 01:00:00	2026-04-05 01:00:00	SCHEDULED	f	2025-10-12 09:28:59.481	2025-10-27 20:55:18.438
133	4	23	2026-04-06 00:00:00	2026-04-13 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.481	2025-10-27 20:55:18.438
134	4	24	2026-04-14 00:00:00	2026-04-21 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.482	2025-10-27 20:55:18.438
135	4	25	2026-04-22 00:00:00	2026-04-29 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.483	2025-10-27 20:55:18.438
136	4	26	2026-04-30 00:00:00	2026-05-07 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.483	2025-10-27 20:55:18.438
137	4	27	2026-05-08 00:00:00	2026-05-15 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.484	2025-10-27 20:55:18.438
138	4	28	2026-05-16 00:00:00	2026-05-23 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.485	2025-10-27 20:55:18.438
139	4	29	2026-05-24 00:00:00	2026-05-31 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.485	2025-10-27 20:55:18.438
140	4	30	2026-06-01 00:00:00	2026-06-08 00:00:00	SCHEDULED	f	2025-10-12 09:28:59.486	2025-10-27 20:55:18.438
109	3	33	2026-04-03 00:00:00	2026-04-09 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.668	2025-10-27 20:55:32.386
110	3	34	2026-04-10 00:00:00	2026-04-16 00:00:00	SCHEDULED	f	2025-10-06 18:06:56.669	2025-10-27 20:55:32.386
95	3	19	2025-12-26 01:00:00	2026-01-01 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.66	2025-10-27 20:55:32.386
96	3	20	2026-01-02 01:00:00	2026-01-08 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.66	2025-10-27 20:55:32.386
97	3	21	2026-01-09 01:00:00	2026-01-15 01:00:00	SCHEDULED	f	2025-10-06 18:06:56.661	2025-10-27 20:55:32.386
78	3	2	2025-08-29 00:00:00	2025-08-31 00:00:00	COMPLETED	f	2025-10-06 18:06:56.65	2025-10-27 20:55:32.386
77	3	1	2025-08-22 00:00:00	2025-08-24 00:00:00	COMPLETED	f	2025-10-06 18:06:56.649	2025-10-27 20:55:32.386
79	3	3	2025-09-12 00:00:00	2025-09-14 00:00:00	COMPLETED	f	2025-10-06 18:06:56.65	2025-10-27 20:55:32.386
80	3	4	2025-09-19 00:00:00	2025-09-21 00:00:00	COMPLETED	f	2025-10-06 18:06:56.651	2025-10-27 20:55:32.386
81	3	5	2025-09-26 00:00:00	2025-09-28 00:00:00	COMPLETED	f	2025-10-06 18:06:56.651	2025-10-27 20:55:32.386
82	3	6	2025-10-03 00:00:00	2025-10-05 00:00:00	COMPLETED	f	2025-10-06 18:06:56.652	2025-10-27 20:55:32.386
\.


--
-- Data for Name: GameWeekMatch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GameWeekMatch" (id, "gameWeekId", "matchId", "createdAt", "isSynced") FROM stdin;
79	39	171	2025-10-08 10:36:22.483	t
80	39	172	2025-10-08 10:36:22.483	t
81	39	173	2025-10-08 10:36:22.484	t
82	40	174	2025-10-08 10:36:22.484	t
83	40	175	2025-10-08 10:36:22.485	t
103	43	195	2025-10-08 10:36:22.495	t
105	43	197	2025-10-08 10:36:22.496	t
107	43	199	2025-10-08 10:36:22.498	t
108	43	200	2025-10-08 10:36:22.499	t
75	39	167	2025-10-08 10:36:22.477	t
76	39	168	2025-10-08 10:36:22.481	t
77	39	169	2025-10-08 10:36:22.482	t
84	40	176	2025-10-08 10:36:22.485	t
85	40	177	2025-10-08 10:36:22.486	t
86	40	178	2025-10-08 10:36:22.487	t
7	1	29	2025-10-08 10:36:14.88	t
89	41	181	2025-10-08 10:36:22.488	t
90	41	182	2025-10-08 10:36:22.489	t
91	41	183	2025-10-08 10:36:22.489	t
87	40	179	2025-10-08 10:36:22.487	t
92	41	184	2025-10-08 10:36:22.49	t
93	41	185	2025-10-08 10:36:22.49	t
95	41	187	2025-10-08 10:36:22.491	t
96	42	188	2025-10-08 10:36:22.492	t
97	42	189	2025-10-08 10:36:22.492	t
98	42	190	2025-10-08 10:36:22.493	t
100	42	192	2025-10-08 10:36:22.494	t
101	42	193	2025-10-08 10:36:22.494	t
115	45	207	2025-10-08 10:36:22.503	t
12	1	34	2025-10-08 10:36:14.884	t
116	45	208	2025-10-08 10:36:22.504	t
118	45	210	2025-10-08 10:36:22.505	t
119	45	211	2025-10-08 10:36:22.505	t
110	44	202	2025-10-08 10:36:22.5	t
111	44	203	2025-10-08 10:36:22.501	t
13	1	35	2025-10-08 10:36:14.885	t
112	44	204	2025-10-08 10:36:22.501	t
113	44	205	2025-10-08 10:36:22.502	t
5	1	27	2025-10-08 10:36:14.873	t
3096	49	1617	2025-10-24 22:10:30.905	t
14	1	36	2025-10-08 10:36:14.886	t
3097	49	1618	2025-10-24 22:10:30.907	t
6	1	28	2025-10-08 10:36:14.88	t
16	2	38	2025-10-08 10:36:14.887	t
17	2	39	2025-10-08 10:36:14.887	t
9	1	31	2025-10-08 10:36:14.881	t
10	1	32	2025-10-08 10:36:14.882	t
18	2	40	2025-10-08 10:36:14.888	t
11	1	33	2025-10-08 10:36:14.884	t
19	2	41	2025-10-08 10:36:14.888	t
20	2	42	2025-10-08 10:36:14.889	t
131	77	223	2025-10-08 18:35:43.636	t
21	2	43	2025-10-08 10:36:14.89	t
22	2	44	2025-10-08 10:36:14.89	t
23	2	45	2025-10-08 10:36:14.891	t
24	2	46	2025-10-08 10:36:14.891	t
25	3	47	2025-10-08 10:36:14.892	t
26	3	48	2025-10-08 10:36:14.893	t
27	3	49	2025-10-08 10:36:14.893	t
28	3	50	2025-10-08 10:36:14.894	t
15	2	37	2025-10-08 10:36:14.886	t
29	3	51	2025-10-08 10:36:14.894	t
30	3	52	2025-10-08 10:36:14.895	t
31	3	53	2025-10-08 10:36:14.896	t
32	3	54	2025-10-08 10:36:14.896	t
33	3	55	2025-10-08 10:36:14.897	t
34	3	56	2025-10-08 10:36:14.897	t
35	4	57	2025-10-08 10:36:14.898	t
36	4	58	2025-10-08 10:36:14.899	t
37	4	59	2025-10-08 10:36:14.899	t
38	4	60	2025-10-08 10:36:14.9	t
39	4	61	2025-10-08 10:36:14.9	t
40	4	62	2025-10-08 10:36:14.901	t
41	4	63	2025-10-08 10:36:14.902	t
42	4	64	2025-10-08 10:36:14.902	t
43	4	65	2025-10-08 10:36:14.903	t
44	4	66	2025-10-08 10:36:14.904	t
45	5	67	2025-10-08 10:36:14.904	t
46	5	68	2025-10-08 10:36:14.905	t
47	5	69	2025-10-08 10:36:14.905	t
48	5	70	2025-10-08 10:36:14.906	t
49	5	71	2025-10-08 10:36:14.907	t
50	5	72	2025-10-08 10:36:14.907	t
51	5	73	2025-10-08 10:36:14.908	t
52	5	74	2025-10-08 10:36:14.908	t
53	5	75	2025-10-08 10:36:14.909	t
54	5	76	2025-10-08 10:36:14.91	t
55	6	77	2025-10-08 10:36:14.91	t
56	6	78	2025-10-08 10:36:14.911	t
57	6	79	2025-10-08 10:36:14.911	t
58	6	80	2025-10-08 10:36:14.912	t
59	6	81	2025-10-08 10:36:14.912	t
60	6	82	2025-10-08 10:36:14.913	t
61	6	83	2025-10-08 10:36:14.913	t
62	6	84	2025-10-08 10:36:14.914	t
63	6	85	2025-10-08 10:36:14.915	t
64	6	86	2025-10-08 10:36:14.915	t
65	7	87	2025-10-08 10:36:14.916	t
66	7	88	2025-10-08 10:36:14.917	t
67	7	89	2025-10-08 10:36:14.917	t
68	7	90	2025-10-08 10:36:14.918	t
69	7	91	2025-10-08 10:36:14.919	t
70	7	92	2025-10-08 10:36:14.919	t
71	7	93	2025-10-08 10:36:14.92	t
72	7	94	2025-10-08 10:36:14.92	t
73	7	95	2025-10-08 10:36:14.921	t
74	7	96	2025-10-08 10:36:14.921	t
3098	49	1619	2025-10-24 22:10:30.908	t
129	77	221	2025-10-08 18:35:43.634	t
130	77	222	2025-10-08 18:35:43.635	t
132	77	224	2025-10-08 18:35:43.637	t
133	77	225	2025-10-08 18:35:43.637	t
135	78	227	2025-10-08 18:35:43.638	t
136	78	228	2025-10-08 18:35:43.639	t
137	78	229	2025-10-08 18:35:43.64	t
138	78	230	2025-10-08 18:35:43.64	t
139	78	231	2025-10-08 18:35:43.641	t
126	77	218	2025-10-08 18:35:43.627	t
134	78	226	2025-10-08 18:35:43.638	t
3785	85	1890	2025-10-27 20:55:52.237	t
8	1	30	2025-10-08 10:36:14.881	t
78	39	170	2025-10-08 10:36:22.482	t
122	46	214	2025-10-08 10:36:22.507	t
123	46	215	2025-10-08 10:36:22.507	t
124	46	216	2025-10-08 10:36:22.508	t
125	46	217	2025-10-08 10:36:22.508	t
291	47	331	2025-10-11 16:31:24.404	t
294	47	334	2025-10-11 16:32:53.573	t
258	40	298	2025-10-11 15:54:05.622	t
270	43	310	2025-10-11 16:11:43.358	t
273	43	313	2025-10-11 16:13:48.828	t
267	43	307	2025-10-11 16:10:36.869	t
268	43	308	2025-10-11 16:10:55.205	t
280	45	320	2025-10-11 16:22:47.862	t
288	46	328	2025-10-11 16:27:47.943	t
289	46	329	2025-10-11 16:28:09.155	t
293	47	333	2025-10-11 16:32:29.995	t
328	48	368	2025-10-18 11:23:49.586	t
269	43	309	2025-10-11 16:11:15.565	t
256	40	296	2025-10-11 15:52:21.071	t
175	8	267	2025-10-11 14:18:42.201	t
325	48	365	2025-10-18 11:22:51.317	t
326	48	366	2025-10-18 11:23:14.822	t
178	8	270	2025-10-11 14:21:56.802	t
179	8	271	2025-10-11 14:22:22.247	t
180	8	272	2025-10-11 14:22:47.348	t
182	8	274	2025-10-11 14:23:25.196	t
330	9	370	2025-10-18 11:28:05.001	t
327	48	367	2025-10-18 11:23:30.482	t
331	9	371	2025-10-18 11:28:30.56	t
332	9	372	2025-10-18 11:28:47.158	t
329	9	369	2025-10-18 11:27:45.084	t
183	8	275	2025-10-11 14:24:19.116	t
320	48	360	2025-10-18 11:21:07.357	t
254	40	294	2025-10-11 15:51:11	t
321	48	361	2025-10-18 11:21:26.934	t
142	79	234	2025-10-08 18:35:43.643	t
290	46	330	2025-10-11 16:28:28.036	t
255	40	295	2025-10-11 15:52:02.866	t
295	47	335	2025-10-11 16:33:11.758	t
297	47	337	2025-10-11 16:33:58.341	t
296	47	336	2025-10-11 16:33:34.112	t
298	47	338	2025-10-11 16:34:19.372	t
300	47	340	2025-10-11 16:34:58.117	t
285	46	325	2025-10-11 16:27:01.035	t
286	46	326	2025-10-11 16:27:18.757	t
287	46	327	2025-10-11 16:27:32.961	t
259	41	299	2025-10-11 16:01:21.48	t
260	41	300	2025-10-11 16:02:04.96	t
261	41	301	2025-10-11 16:02:23.023	t
102	42	194	2025-10-08 10:36:22.495	t
117	45	209	2025-10-08 10:36:22.504	t
274	44	314	2025-10-11 16:18:04.067	t
275	44	315	2025-10-11 16:18:40.976	t
276	44	316	2025-10-11 16:18:59.333	t
277	44	317	2025-10-11 16:19:21.864	t
279	44	319	2025-10-11 16:19:53.67	t
184	39	276	2025-10-11 14:28:00.404	t
185	39	277	2025-10-11 14:28:25.931	t
186	39	278	2025-10-11 14:29:48.191	t
263	42	303	2025-10-11 16:06:25.356	t
264	42	304	2025-10-11 16:07:29.879	t
265	42	305	2025-10-11 16:07:48.333	t
266	42	306	2025-10-11 16:08:07.128	t
282	45	322	2025-10-11 16:23:16.871	t
283	45	323	2025-10-11 16:23:30.361	t
284	45	324	2025-10-11 16:23:46.522	t
299	47	339	2025-10-11 16:34:36.298	t
319	48	359	2025-10-18 11:20:44.902	t
177	8	269	2025-10-11 14:21:39.468	t
278	44	318	2025-10-11 16:19:37.703	t
3100	49	1621	2025-10-24 22:10:30.911	t
176	8	268	2025-10-11 14:21:18.484	t
143	79	235	2025-10-08 18:35:43.644	t
144	79	236	2025-10-08 18:35:43.644	t
145	79	237	2025-10-08 18:35:43.645	t
146	79	238	2025-10-08 18:35:43.646	t
147	79	239	2025-10-08 18:35:43.646	t
148	79	240	2025-10-08 18:35:43.647	t
149	79	241	2025-10-08 18:35:43.647	t
150	80	242	2025-10-08 18:35:43.648	t
152	80	244	2025-10-08 18:35:43.649	t
153	80	245	2025-10-08 18:35:43.65	t
154	80	246	2025-10-08 18:35:43.651	t
155	80	247	2025-10-08 18:35:43.651	t
156	80	248	2025-10-08 18:35:43.652	t
157	80	249	2025-10-08 18:35:43.652	t
158	81	250	2025-10-08 18:35:43.653	t
159	81	251	2025-10-08 18:35:43.653	t
160	81	252	2025-10-08 18:35:43.654	t
162	81	254	2025-10-08 18:35:43.655	t
163	81	255	2025-10-08 18:35:43.656	t
165	81	257	2025-10-08 18:35:43.657	t
170	82	262	2025-10-08 18:35:43.66	t
244	82	284	2025-10-11 15:19:25.146	t
168	82	260	2025-10-08 18:35:43.659	t
169	82	261	2025-10-08 18:35:43.659	t
172	82	264	2025-10-08 18:35:43.661	t
243	81	283	2025-10-11 15:17:39.883	t
166	82	258	2025-10-08 18:35:43.658	t
173	82	265	2025-10-08 18:35:43.661	t
245	83	285	2025-10-11 15:20:43.73	t
246	83	286	2025-10-11 15:21:25.461	t
247	83	287	2025-10-11 15:21:51.777	t
171	82	263	2025-10-08 18:35:43.66	t
167	82	259	2025-10-08 18:35:43.658	t
239	77	279	2025-10-11 15:10:32.582	t
242	80	282	2025-10-11 15:16:22.355	t
248	83	288	2025-10-11 15:22:27.544	t
241	79	281	2025-10-11 15:14:38.501	t
249	83	289	2025-10-11 15:22:53.814	t
240	78	280	2025-10-11 15:12:43.525	t
250	83	290	2025-10-11 15:23:17.863	t
251	83	291	2025-10-11 15:23:40.561	t
252	83	292	2025-10-11 15:24:08.148	t
253	83	293	2025-10-11 15:24:40.186	t
3786	85	1891	2025-10-27 20:55:52.239	t
3795	120	1900	2025-10-27 20:56:14.212	t
322	48	362	2025-10-18 11:21:47.643	t
141	78	233	2025-10-08 18:35:43.642	t
3796	120	1901	2025-10-27 20:56:14.213	t
3797	120	1902	2025-10-27 20:56:14.214	t
140	78	232	2025-10-08 18:35:43.641	t
3787	85	1892	2025-10-27 20:55:52.241	t
3788	85	1893	2025-10-27 20:55:52.242	t
3789	85	1894	2025-10-27 20:55:52.243	t
3790	85	1895	2025-10-27 20:55:52.245	t
3792	85	1897	2025-10-27 20:55:52.247	t
3793	85	1898	2025-10-27 20:55:52.248	t
3099	49	1620	2025-10-24 22:10:30.91	t
323	48	363	2025-10-18 11:22:04.822	t
324	48	364	2025-10-18 11:22:32.706	t
174	8	266	2025-10-11 14:18:11.412	t
181	8	273	2025-10-11 14:23:05.712	t
333	9	373	2025-10-18 11:29:03.992	t
335	9	375	2025-10-18 11:29:37.342	t
336	9	376	2025-10-18 11:29:59.947	t
334	9	374	2025-10-18 11:29:17.917	t
337	9	377	2025-10-18 11:30:16.395	t
338	9	378	2025-10-18 11:30:32.894	t
3823	11	1928	2025-10-27 20:56:53.564	t
3824	11	1929	2025-10-27 20:56:53.565	t
3825	11	1930	2025-10-27 20:56:53.566	t
3826	11	1931	2025-10-27 20:56:53.568	t
3827	11	1932	2025-10-27 20:56:53.569	t
3798	120	1903	2025-10-27 20:56:14.215	t
3799	120	1904	2025-10-27 20:56:14.216	t
3800	120	1905	2025-10-27 20:56:14.217	t
3801	120	1906	2025-10-27 20:56:14.218	t
3802	120	1907	2025-10-27 20:56:14.22	t
3803	120	1908	2025-10-27 20:56:14.221	t
127	77	219	2025-10-08 18:35:43.633	t
151	80	243	2025-10-08 18:35:43.648	t
164	81	256	2025-10-08 18:35:43.656	t
161	81	253	2025-10-08 18:35:43.654	t
3804	86	1909	2025-10-27 20:56:28.581	t
3805	86	1910	2025-10-27 20:56:28.583	t
3806	86	1911	2025-10-27 20:56:28.584	t
3807	86	1912	2025-10-27 20:56:28.585	t
3808	86	1913	2025-10-27 20:56:28.586	t
3809	86	1914	2025-10-27 20:56:28.588	t
3810	86	1915	2025-10-27 20:56:28.589	t
3811	86	1916	2025-10-27 20:56:28.59	t
3812	86	1917	2025-10-27 20:56:28.591	t
3828	11	1933	2025-10-27 20:56:53.57	t
3829	11	1934	2025-10-27 20:56:53.571	t
3830	11	1935	2025-10-27 20:56:53.573	t
3831	11	1936	2025-10-27 20:56:53.574	t
3832	11	1937	2025-10-27 20:56:53.575	t
3101	49	1622	2025-10-24 22:10:30.912	t
3102	49	1623	2025-10-24 22:10:30.913	t
3103	49	1624	2025-10-24 22:10:30.915	t
3104	49	1625	2025-10-24 22:10:30.916	t
3105	49	1626	2025-10-24 22:10:30.917	t
272	43	312	2025-10-11 16:13:35.837	t
292	47	332	2025-10-11 16:32:00.574	t
262	41	302	2025-10-11 16:02:41.279	t
281	45	321	2025-10-11 16:23:02.821	t
3813	50	1918	2025-10-27 20:56:43.858	t
3814	50	1919	2025-10-27 20:56:43.859	t
3815	50	1920	2025-10-27 20:56:43.861	t
3816	50	1921	2025-10-27 20:56:43.862	t
3817	50	1922	2025-10-27 20:56:43.863	t
3818	50	1923	2025-10-27 20:56:43.864	t
3819	50	1924	2025-10-27 20:56:43.865	t
3820	50	1925	2025-10-27 20:56:43.866	t
3821	50	1926	2025-10-27 20:56:43.867	t
3822	50	1927	2025-10-27 20:56:43.868	t
3439	151	1798	2025-10-25 12:14:50.009	t
3440	151	1799	2025-10-25 12:14:50.01	t
3106	52	1627	2025-10-24 22:10:56.965	t
3107	52	1628	2025-10-24 22:10:56.967	t
3108	52	1629	2025-10-24 22:10:56.969	t
3109	52	1630	2025-10-24 22:10:56.97	t
3110	52	1631	2025-10-24 22:10:56.972	t
3111	52	1632	2025-10-24 22:10:56.974	t
3112	52	1633	2025-10-24 22:10:56.976	t
3113	52	1634	2025-10-24 22:10:56.977	t
3114	52	1635	2025-10-24 22:10:56.978	t
3115	52	1636	2025-10-24 22:10:56.981	t
3794	120	1899	2025-10-27 20:56:14.211	t
128	77	220	2025-10-08 18:35:43.633	t
3791	85	1896	2025-10-27 20:55:52.246	t
3387	157	1746	2025-10-25 12:14:25.377	t
3388	157	1747	2025-10-25 12:14:25.379	t
3389	157	1748	2025-10-25 12:14:25.381	t
3390	157	1749	2025-10-25 12:14:25.382	t
3391	157	1750	2025-10-25 12:14:25.383	t
3392	157	1751	2025-10-25 12:14:25.385	t
3393	157	1752	2025-10-25 12:14:25.386	t
3394	157	1753	2025-10-25 12:14:25.387	t
3395	157	1754	2025-10-25 12:14:25.388	t
3396	157	1755	2025-10-25 12:14:25.389	t
3397	157	1756	2025-10-25 12:14:25.391	t
3398	157	1757	2025-10-25 12:14:25.392	t
3399	157	1758	2025-10-25 12:14:25.393	t
3400	157	1759	2025-10-25 12:14:25.394	t
3401	157	1760	2025-10-25 12:14:25.395	t
3402	157	1761	2025-10-25 12:14:25.396	t
3403	157	1762	2025-10-25 12:14:25.397	t
3404	157	1763	2025-10-25 12:14:25.398	t
3405	150	1764	2025-10-25 12:14:41.188	t
3406	150	1765	2025-10-25 12:14:41.189	t
3407	150	1766	2025-10-25 12:14:41.19	t
3408	150	1767	2025-10-25 12:14:41.191	t
3409	150	1768	2025-10-25 12:14:41.192	t
3410	150	1769	2025-10-25 12:14:41.193	t
3411	150	1770	2025-10-25 12:14:41.194	t
3412	150	1771	2025-10-25 12:14:41.195	t
3413	150	1772	2025-10-25 12:14:41.196	t
3414	150	1773	2025-10-25 12:14:41.197	t
3415	150	1774	2025-10-25 12:14:41.198	t
3416	150	1775	2025-10-25 12:14:41.199	t
3417	150	1776	2025-10-25 12:14:41.201	t
3418	150	1777	2025-10-25 12:14:41.202	t
3419	150	1778	2025-10-25 12:14:41.203	t
3420	150	1779	2025-10-25 12:14:41.204	t
3421	150	1780	2025-10-25 12:14:41.205	t
3422	150	1781	2025-10-25 12:14:41.206	t
3423	151	1782	2025-10-25 12:14:49.991	t
3424	151	1783	2025-10-25 12:14:49.993	t
3425	151	1784	2025-10-25 12:14:49.994	t
3426	151	1785	2025-10-25 12:14:49.995	t
3427	151	1786	2025-10-25 12:14:49.996	t
3428	151	1787	2025-10-25 12:14:49.997	t
3429	151	1788	2025-10-25 12:14:49.998	t
3430	151	1789	2025-10-25 12:14:49.999	t
3431	151	1790	2025-10-25 12:14:50	t
3432	151	1791	2025-10-25 12:14:50.001	t
3433	151	1792	2025-10-25 12:14:50.002	t
3434	151	1793	2025-10-25 12:14:50.003	t
3435	151	1794	2025-10-25 12:14:50.004	t
3436	151	1795	2025-10-25 12:14:50.005	t
3437	151	1796	2025-10-25 12:14:50.006	t
3438	151	1797	2025-10-25 12:14:50.008	t
3449	152	1808	2025-10-25 12:15:11.487	t
3450	152	1809	2025-10-25 12:15:11.488	t
3451	152	1810	2025-10-25 12:15:11.489	t
3452	152	1811	2025-10-25 12:15:11.49	t
3453	152	1812	2025-10-25 12:15:11.492	t
3454	152	1813	2025-10-25 12:15:11.493	t
3455	152	1814	2025-10-25 12:15:11.494	t
3456	152	1815	2025-10-25 12:15:11.495	t
3457	152	1816	2025-10-25 12:15:11.496	t
3458	152	1817	2025-10-25 12:15:11.497	t
3459	154	1818	2025-10-25 12:15:19.151	t
3460	154	1819	2025-10-25 12:15:19.153	t
3461	154	1820	2025-10-25 12:15:19.154	t
3462	154	1821	2025-10-25 12:15:19.155	t
3463	154	1822	2025-10-25 12:15:19.156	t
3464	154	1823	2025-10-25 12:15:19.157	t
3465	154	1824	2025-10-25 12:15:19.158	t
3466	154	1825	2025-10-25 12:15:19.159	t
3467	154	1826	2025-10-25 12:15:19.16	t
3468	154	1827	2025-10-25 12:15:19.161	t
3469	154	1828	2025-10-25 12:15:19.162	t
3470	154	1829	2025-10-25 12:15:19.163	t
3471	154	1830	2025-10-25 12:15:19.165	t
3472	154	1831	2025-10-25 12:15:19.166	t
3473	154	1832	2025-10-25 12:15:19.167	t
3474	154	1833	2025-10-25 12:15:19.168	t
3475	154	1834	2025-10-25 12:15:19.169	t
3476	154	1835	2025-10-25 12:15:19.17	t
3477	156	1836	2025-10-25 12:15:24.963	t
3478	156	1837	2025-10-25 12:15:24.965	t
3479	156	1838	2025-10-25 12:15:24.966	t
3480	156	1839	2025-10-25 12:15:24.967	t
3481	156	1840	2025-10-25 12:15:24.968	t
3482	156	1841	2025-10-25 12:15:24.969	t
3483	156	1842	2025-10-25 12:15:24.971	t
3484	156	1843	2025-10-25 12:15:24.972	t
3485	156	1844	2025-10-25 12:15:24.973	t
3486	156	1845	2025-10-25 12:15:24.974	t
3487	156	1846	2025-10-25 12:15:24.975	t
3488	156	1847	2025-10-25 12:15:24.976	t
3489	156	1848	2025-10-25 12:15:24.977	t
3490	156	1849	2025-10-25 12:15:24.978	t
3491	156	1850	2025-10-25 12:15:24.979	t
3492	156	1851	2025-10-25 12:15:24.98	t
3493	156	1852	2025-10-25 12:15:24.981	t
3494	156	1853	2025-10-25 12:15:24.982	t
3495	153	1854	2025-10-25 12:15:30.273	t
3496	153	1855	2025-10-25 12:15:30.275	t
3497	153	1856	2025-10-25 12:15:30.276	t
3498	153	1857	2025-10-25 12:15:30.277	t
3499	153	1858	2025-10-25 12:15:30.278	t
3500	153	1859	2025-10-25 12:15:30.279	t
3501	153	1860	2025-10-25 12:15:30.28	t
3502	153	1861	2025-10-25 12:15:30.281	t
3503	153	1862	2025-10-25 12:15:30.282	t
3504	153	1863	2025-10-25 12:15:30.283	t
3505	153	1864	2025-10-25 12:15:30.284	t
3506	153	1865	2025-10-25 12:15:30.285	t
3507	153	1866	2025-10-25 12:15:30.286	t
3508	153	1867	2025-10-25 12:15:30.288	t
3509	153	1868	2025-10-25 12:15:30.289	t
3510	153	1869	2025-10-25 12:15:30.291	t
3511	153	1870	2025-10-25 12:15:30.292	t
3512	153	1871	2025-10-25 12:15:30.293	t
3513	155	1872	2025-10-25 12:15:34.856	t
3514	155	1873	2025-10-25 12:15:34.857	t
3515	155	1874	2025-10-25 12:15:34.859	t
3516	155	1875	2025-10-25 12:15:34.86	t
3517	155	1876	2025-10-25 12:15:34.862	t
3518	155	1877	2025-10-25 12:15:34.863	t
3519	155	1878	2025-10-25 12:15:34.864	t
3520	155	1879	2025-10-25 12:15:34.865	t
3521	155	1880	2025-10-25 12:15:34.867	t
3522	155	1881	2025-10-25 12:15:34.868	t
3523	155	1882	2025-10-25 12:15:34.869	t
3524	155	1883	2025-10-25 12:15:34.87	t
3525	155	1884	2025-10-25 12:15:34.871	t
3526	155	1885	2025-10-25 12:15:34.873	t
3527	155	1886	2025-10-25 12:15:34.874	t
3528	155	1887	2025-10-25 12:15:34.875	t
3529	155	1888	2025-10-25 12:15:34.876	t
3530	155	1889	2025-10-25 12:15:34.877	t
3116	84	1637	2025-10-24 22:12:06.569	t
3117	84	1638	2025-10-24 22:12:06.571	t
3119	84	1640	2025-10-24 22:12:06.574	t
3120	84	1641	2025-10-24 22:12:06.575	t
3121	84	1642	2025-10-24 22:12:06.577	t
3118	84	1639	2025-10-24 22:12:06.572	t
3122	84	1643	2025-10-24 22:12:06.579	t
3123	84	1644	2025-10-24 22:12:06.581	t
3124	84	1645	2025-10-24 22:12:06.582	t
3441	152	1800	2025-10-25 12:15:11.474	t
3442	152	1801	2025-10-25 12:15:11.478	t
3443	152	1802	2025-10-25 12:15:11.479	t
3444	152	1803	2025-10-25 12:15:11.481	t
3445	152	1804	2025-10-25 12:15:11.482	t
3446	152	1805	2025-10-25 12:15:11.483	t
3447	152	1806	2025-10-25 12:15:11.484	t
3448	152	1807	2025-10-25 12:15:11.485	t
3125	112	1646	2025-10-24 22:17:41.443	t
3126	112	1647	2025-10-24 22:17:41.445	t
3127	112	1648	2025-10-24 22:17:41.447	t
3128	112	1649	2025-10-24 22:17:41.448	t
3129	112	1650	2025-10-24 22:17:41.45	t
3130	112	1651	2025-10-24 22:17:41.452	t
3131	112	1652	2025-10-24 22:17:41.453	t
3132	112	1653	2025-10-24 22:17:41.455	t
3133	112	1654	2025-10-24 22:17:41.456	t
3134	112	1655	2025-10-24 22:17:41.457	t
3135	117	1656	2025-10-24 23:13:57.432	t
3136	117	1657	2025-10-24 23:13:57.434	t
3137	117	1658	2025-10-24 23:13:57.436	t
3138	117	1659	2025-10-24 23:13:57.437	t
3139	117	1660	2025-10-24 23:13:57.439	t
3140	117	1661	2025-10-24 23:13:57.44	t
3141	117	1662	2025-10-24 23:13:57.441	t
3142	117	1663	2025-10-24 23:13:57.443	t
3143	117	1664	2025-10-24 23:13:57.445	t
3144	117	1665	2025-10-24 23:13:57.447	t
3145	118	1666	2025-10-24 23:14:33.814	t
3146	118	1667	2025-10-24 23:14:33.815	t
3147	118	1668	2025-10-24 23:14:33.816	t
3148	118	1669	2025-10-24 23:14:33.818	t
3149	118	1670	2025-10-24 23:14:33.819	t
3150	118	1671	2025-10-24 23:14:33.82	t
3151	118	1672	2025-10-24 23:14:33.821	t
3152	118	1673	2025-10-24 23:14:33.822	t
3153	118	1674	2025-10-24 23:14:33.824	t
3154	118	1675	2025-10-24 23:14:33.825	t
3165	111	1686	2025-10-24 23:17:56.322	t
3166	111	1687	2025-10-24 23:17:56.324	t
3167	111	1688	2025-10-24 23:17:56.325	t
3168	111	1689	2025-10-24 23:17:56.326	t
3169	111	1690	2025-10-24 23:17:56.327	t
3170	111	1691	2025-10-24 23:17:56.328	t
3171	111	1692	2025-10-24 23:17:56.329	t
3172	111	1693	2025-10-24 23:17:56.33	t
3173	111	1694	2025-10-24 23:17:56.331	t
3174	111	1695	2025-10-24 23:17:56.333	t
2586	21	1597	2025-10-24 21:57:29.134	t
2587	21	1598	2025-10-24 21:57:29.139	t
2588	21	1599	2025-10-24 21:57:29.141	t
2589	21	1600	2025-10-24 21:57:29.143	t
2590	21	1601	2025-10-24 21:57:29.145	t
2591	21	1602	2025-10-24 21:57:29.146	t
2592	21	1603	2025-10-24 21:57:29.147	t
2593	21	1604	2025-10-24 21:57:29.149	t
2594	21	1605	2025-10-24 21:57:29.15	t
2595	21	1606	2025-10-24 21:57:29.151	t
3223	119	1744	2025-10-24 23:19:21.329	t
3224	119	1745	2025-10-24 23:19:21.33	t
2602	10	1613	2025-10-24 22:01:47.518	t
2603	10	1614	2025-10-24 22:01:47.519	t
2604	10	1615	2025-10-24 22:01:47.52	t
2605	10	1616	2025-10-24 22:01:47.521	t
2596	10	1607	2025-10-24 22:01:47.509	t
2597	10	1608	2025-10-24 22:01:47.511	t
2598	10	1609	2025-10-24 22:01:47.512	t
2599	10	1610	2025-10-24 22:01:47.514	t
2600	10	1611	2025-10-24 22:01:47.515	t
2601	10	1612	2025-10-24 22:01:47.517	t
3175	113	1696	2025-10-24 23:18:29.07	t
3176	113	1697	2025-10-24 23:18:29.072	t
3177	113	1698	2025-10-24 23:18:29.074	t
3178	113	1699	2025-10-24 23:18:29.075	t
3179	113	1700	2025-10-24 23:18:29.077	t
3180	113	1701	2025-10-24 23:18:29.078	t
3181	113	1702	2025-10-24 23:18:29.08	t
3182	113	1703	2025-10-24 23:18:29.081	t
3183	113	1704	2025-10-24 23:18:29.082	t
3184	113	1705	2025-10-24 23:18:29.084	t
3185	114	1706	2025-10-24 23:18:38.854	t
3186	114	1707	2025-10-24 23:18:38.855	t
3187	114	1708	2025-10-24 23:18:38.857	t
3188	114	1709	2025-10-24 23:18:38.858	t
3189	114	1710	2025-10-24 23:18:38.859	t
3190	114	1711	2025-10-24 23:18:38.86	t
3191	114	1712	2025-10-24 23:18:38.861	t
3192	114	1713	2025-10-24 23:18:38.862	t
3193	114	1714	2025-10-24 23:18:38.864	t
3194	114	1715	2025-10-24 23:18:38.865	t
3195	115	1716	2025-10-24 23:18:47.053	t
3196	115	1717	2025-10-24 23:18:47.054	t
3197	115	1718	2025-10-24 23:18:47.055	t
3198	115	1719	2025-10-24 23:18:47.056	t
3199	115	1720	2025-10-24 23:18:47.057	t
3200	115	1721	2025-10-24 23:18:47.058	t
3201	115	1722	2025-10-24 23:18:47.059	t
3202	115	1723	2025-10-24 23:18:47.06	t
3203	115	1724	2025-10-24 23:18:47.062	t
3204	115	1725	2025-10-24 23:18:47.063	t
3205	116	1726	2025-10-24 23:18:56.259	t
3206	116	1727	2025-10-24 23:18:56.26	t
3207	116	1728	2025-10-24 23:18:56.262	t
3208	116	1729	2025-10-24 23:18:56.263	t
3209	116	1730	2025-10-24 23:18:56.264	t
3210	116	1731	2025-10-24 23:18:56.265	t
3211	116	1732	2025-10-24 23:18:56.266	t
3212	116	1733	2025-10-24 23:18:56.267	t
3213	116	1734	2025-10-24 23:18:56.268	t
3214	116	1735	2025-10-24 23:18:56.269	t
3215	119	1736	2025-10-24 23:19:21.32	t
3216	119	1737	2025-10-24 23:19:21.321	t
3217	119	1738	2025-10-24 23:19:21.322	t
3218	119	1739	2025-10-24 23:19:21.323	t
3219	119	1740	2025-10-24 23:19:21.324	t
3220	119	1741	2025-10-24 23:19:21.325	t
3221	119	1742	2025-10-24 23:19:21.326	t
3222	119	1743	2025-10-24 23:19:21.328	t
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Group" (id, name, description, code, "isPrivate", "joinCode", "maxMembers", "ownerId", "logoUrl", "createdAt", "updatedAt", "isPublic", "leagueId", "allowedTeamIds") FROM stdin;
6	Serie A - Public Group	Official public group for Serie A. All players are automatically joined when they make their first prediction in this league.	cmgo3gz1x0001l8bwagxf475u	f	\N	50	1	/logos/serie-a/serie-a.svg	2025-10-12 19:25:46.486	2025-10-12 19:25:46.486	t	4	{}
7	Bundesliga - Public Group	Official public group for Bundesliga. All players are automatically joined when they make their first prediction in this league.	cmgo3gz210003l8bwosplkt4e	f	\N	50	1	/logos/bundesliga/bundesliga.svg	2025-10-12 19:25:46.489	2025-10-12 19:25:46.489	t	3	{}
8	La Liga - Public Group	Official public group for La Liga. All players are automatically joined when they make their first prediction in this league.	cmgo3gz220005l8bwh6td4xqx	f	\N	50	1	/logos/la-liga/spain_la-liga.svg	2025-10-12 19:25:46.49	2025-10-12 19:25:46.49	t	2	{}
9	Premier League - Public Group	Official public group for Premier League. All players are automatically joined when they make their first prediction in this league.	cmgo3gz230007l8bwpy2gziu1	f	\N	50	1	/logos/premier-league/premier-league.svg	2025-10-12 19:25:46.491	2025-10-12 19:25:46.491	t	1	{}
10	Mustafa and Yousef	Mustafa and Yousef	cmgvbbtbu0005l8swetbfmybt	t	MUSTAF5945	50	2	https://ui-avatars.com/api/?name=Mustafa%20and%20Yousef&background=random	2025-10-17 20:40:05.946	2025-10-17 20:40:05.946	f	1	{}
11	My custom one 1	My custom one My custom one	cmgvbrjmy0001l8ag6pw5q4mh	t	MY CUS0888	60	2	https://ui-avatars.com/api/?name=My%20custom%20one&background=random	2025-10-17 20:52:19.882	2025-10-17 21:08:02.318	f	\N	{41,51,28,37,29,26,5,10,19,11,15,71,67,68,72}
\.


--
-- Data for Name: GroupChangeRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GroupChangeRequest" (id, "groupId", "requestedById", "reviewedBy", "changeType", "currentValue", "requestedValue", reason, status, "reviewNote", "createdAt", "reviewedAt") FROM stdin;
\.


--
-- Data for Name: GroupMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GroupMember" (id, "groupId", "userId", role, "joinedAt", "pointsByLeague", "totalPoints", "lastUpdated", "pointsByGameweek") FROM stdin;
21	10	2	OWNER	2025-10-17 20:40:05.953	{"1": 95}	95	2025-11-03 12:53:11.166	{"1": {"8": 31, "9": 27, "10": 37}}
20	9	2	MEMBER	2025-10-12 20:19:46.385	{"1": 95}	95	2025-11-03 12:53:11.167	{"1": {"8": 31, "9": 27, "10": 37}}
19	7	2	MEMBER	2025-10-12 20:18:01.27	{"3": 35}	35	2025-11-03 12:51:16.314	{"3": {"7": 22, "8": 13}}
15	7	3	MEMBER	2025-10-12 19:50:04.163	{"3": 24}	24	2025-11-03 12:51:16.318	{"3": {"7": 16, "8": 8}}
18	8	2	MEMBER	2025-10-12 20:15:43.51	{"2": 82}	82	2025-11-03 12:51:16.325	{"2": {"9": 24, "10": 23, "11": 35}}
16	8	3	MEMBER	2025-10-12 20:00:34.024	{"2": 71}	71	2025-11-03 12:51:16.328	{"2": {"9": 35, "10": 15, "11": 21}}
23	11	3	MEMBER	2025-10-17 20:55:49.721	{"1": 41, "2": 31, "3": 12}	84	2025-11-03 12:52:39.37	{"1": {"8": 13, "9": 7, "10": 21}, "2": {"9": 12, "10": 6, "11": 13}, "3": {"7": 4, "8": 8}}
22	11	2	OWNER	2025-10-17 20:52:19.888	{"1": 48, "2": 44, "3": 17}	109	2025-11-03 12:52:39.376	{"1": {"8": 14, "9": 16, "10": 18}, "2": {"9": 15, "10": 10, "11": 19}, "3": {"7": 4, "8": 13}}
17	9	3	MEMBER	2025-10-12 20:02:24.889	{"1": 92}	92	2025-11-03 12:53:11.161	{"1": {"8": 33, "9": 30, "10": 29}}
\.


--
-- Data for Name: League; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."League" (id, name, code, country, "logoUrl", season, "startDate", "endDate", "isActive", priority, "createdAt", "updatedAt") FROM stdin;
1	Premier League	EPL	England	/logos/premier-league/premier-league.svg	2025/26	2025-08-15 00:00:00	2026-05-24 00:00:00	t	1	2025-10-06 18:06:56.071	2025-10-11 17:20:57.45
2	La Liga	LALIGA	Spain	/logos/la-liga/spain_la-liga.svg	2025/26	2025-08-14 00:00:00	2026-05-24 00:00:00	t	2	2025-10-06 18:06:56.071	2025-10-11 17:20:57.458
5	UEFA Champions League	UCL	Europe	/logos/ucl/ucl.svg	2024/2025	2024-09-01 00:00:00	2025-05-31 00:00:00	t	4	2025-10-24 23:28:25.003	2025-10-24 23:40:24.777
4	Serie A	SA	Italy	/logos/serie-a/serie-a.svg	2025/2026	2025-10-11 00:00:00	2026-08-12 00:00:00	t	6	2025-10-12 09:15:24.133	2025-10-24 23:44:38.836
3	Bundesliga	BL1	Germany	/logos/bundesliga/bundesliga.svg	2025/26	2025-08-22 00:00:00	2026-05-16 00:00:00	t	5	2025-10-06 18:06:56.071	2025-10-24 23:44:53.114
\.


--
-- Data for Name: LoginHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoginHistory" (id, "userId", "ipAddress", "userAgent", "loginStatus", "failReason", "createdAt") FROM stdin;
6	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 19:35:35.269
7	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 19:36:33.563
8	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 19:37:47.412
9	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 19:41:42.244
10	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 20:05:39.151
11	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-12 20:06:30.813
12	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 20:25:18.975
13	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 20:26:06.148
14	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 20:52:41.266
15	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 20:56:18.61
16	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 21:04:37.932
17	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-17 21:08:12.954
18	2	::ffff:192.168.178.20	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 EdgA/141.0.0.0	t	\N	2025-10-17 21:11:25.944
19	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-18 00:04:15.457
20	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	t	\N	2025-10-19 17:35:42.996
21	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-24 22:18:23.635
22	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-24 22:37:30.345
23	2	::1	curl/8.15.0	t	\N	2025-10-24 23:06:59.656
24	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-24 23:08:24.216
25	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-24 23:13:16.795
26	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 13:47:50.634
27	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 13:48:41.894
28	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 13:53:10.072
29	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 13:56:55.544
30	2	::1	curl/8.15.0	t	\N	2025-10-25 14:32:28.593
31	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 14:32:47.982
32	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-25 14:43:17.547
33	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-27 21:07:52.676
34	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-27 21:10:45.077
35	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-27 21:50:03.405
36	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-27 21:50:26.115
37	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-30 21:41:54.607
38	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-30 21:47:36.606
39	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-30 21:52:38.037
40	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-10-30 22:02:11.805
41	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-11-01 17:53:58.246
42	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-11-03 12:50:18.511
43	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-11-03 12:52:39.06
44	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	t	\N	2025-11-03 12:53:10.874
\.


--
-- Data for Name: Match; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Match" (id, "leagueId", "homeTeamId", "awayTeamId", "matchDate", "weekNumber", "homeScore", "awayScore", status, "isPredictionLocked", "createdAt", "updatedAt", "isPostponed", "originalWeekNumber", "isSynced") FROM stdin;
318	2	25	31	2025-09-24 16:00:00	6	1	1	FINISHED	f	2025-10-11 16:19:37.698	2025-10-18 11:08:01.039	f	\N	t
1617	2	25	23	2025-10-31 20:00:00	11	2	1	FINISHED	f	2025-10-24 22:10:30.9	2025-11-03 12:51:05.901	f	\N	f
1618	2	39	34	2025-11-01 13:00:00	11	4	0	FINISHED	f	2025-10-24 22:10:30.906	2025-11-03 12:51:05.902	f	\N	f
1619	2	26	35	2025-11-01 15:15:00	11	3	0	FINISHED	f	2025-10-24 22:10:30.908	2025-11-03 12:51:05.903	f	\N	f
1620	2	38	28	2025-11-01 17:30:00	11	3	2	FINISHED	f	2025-10-24 22:10:30.909	2025-11-03 12:51:05.903	f	\N	f
1621	2	29	40	2025-11-01 20:00:00	11	4	0	FINISHED	f	2025-10-24 22:10:30.91	2025-11-03 12:51:05.904	f	\N	f
1622	2	21	33	2025-11-02 13:00:00	11	1	2	FINISHED	f	2025-10-24 22:10:30.911	2025-11-03 12:51:05.905	f	\N	f
1623	2	31	36	2025-11-02 15:15:00	11	2	1	FINISHED	f	2025-10-24 22:10:30.913	2025-11-03 12:51:05.905	f	\N	f
1624	2	37	32	2025-11-02 17:30:00	11	3	1	FINISHED	f	2025-10-24 22:10:30.914	2025-11-03 12:51:05.906	f	\N	f
1625	2	24	30	2025-11-02 20:00:00	11	3	0	FINISHED	f	2025-10-24 22:10:30.915	2025-11-03 12:51:05.906	f	\N	f
1626	2	22	27	2025-11-03 20:00:00	11	\N	\N	SCHEDULED	f	2025-10-24 22:10:30.917	2025-11-03 12:51:05.907	f	\N	f
219	3	44	56	2025-08-23 12:30:00	1	4	1	FINISHED	t	2025-10-08 18:35:32.393	2025-10-11 17:14:47.076	f	\N	t
220	3	50	42	2025-08-23 12:30:00	1	1	3	FINISHED	t	2025-10-08 18:35:32.394	2025-10-11 17:14:47.076	f	\N	t
221	3	47	58	2025-08-23 12:30:00	1	1	3	FINISHED	t	2025-10-08 18:35:32.395	2025-10-11 17:14:47.076	f	\N	t
222	3	43	48	2025-08-23 12:30:00	1	1	2	FINISHED	t	2025-10-08 18:35:32.395	2025-10-11 17:14:47.076	f	\N	t
223	3	53	55	2025-08-23 12:30:00	1	2	1	FINISHED	t	2025-10-08 18:35:32.396	2025-10-11 17:14:47.076	f	\N	t
224	3	54	57	2025-08-24 12:30:00	1	0	1	FINISHED	t	2025-10-08 18:35:32.397	2025-10-11 17:14:47.076	f	\N	t
225	3	46	45	2025-08-24 14:30:00	1	0	0	FINISHED	t	2025-10-08 18:35:32.398	2025-10-11 17:14:47.076	f	\N	t
227	3	52	47	2025-08-30 12:30:00	2	2	0	FINISHED	t	2025-10-08 18:35:32.399	2025-10-11 17:14:47.076	f	\N	t
228	3	55	46	2025-08-30 12:30:00	2	1	0	FINISHED	t	2025-10-08 18:35:32.4	2025-10-11 17:14:47.076	f	\N	t
229	3	56	43	2025-08-30 12:30:00	2	3	3	FINISHED	t	2025-10-08 18:35:32.401	2025-10-11 17:14:47.076	f	\N	t
230	3	42	41	2025-08-30 15:30:00	2	2	3	FINISHED	t	2025-10-08 18:35:32.401	2025-10-11 17:14:47.076	f	\N	t
231	3	58	54	2025-08-31 12:30:00	2	1	1	FINISHED	t	2025-10-08 18:35:32.402	2025-10-11 17:14:47.076	f	\N	t
232	3	51	53	2025-08-31 14:30:00	2	3	0	FINISHED	t	2025-10-08 18:35:32.403	2025-10-11 17:14:47.076	f	\N	t
233	3	57	50	2025-08-31 16:30:00	2	4	1	FINISHED	t	2025-10-08 18:35:32.404	2025-10-11 17:14:47.076	f	\N	t
234	3	43	44	2025-09-12 17:30:00	3	3	1	FINISHED	t	2025-10-08 18:35:32.404	2025-10-11 17:14:47.076	f	\N	t
235	3	50	55	2025-09-13 12:30:00	3	3	1	FINISHED	t	2025-10-08 18:35:32.405	2025-10-11 17:14:47.076	f	\N	t
236	3	47	51	2025-09-13 12:30:00	3	0	2	FINISHED	t	2025-10-08 18:35:32.406	2025-10-11 17:14:47.076	f	\N	t
237	3	54	52	2025-09-13 12:30:00	3	0	1	FINISHED	t	2025-10-08 18:35:32.406	2025-10-11 17:14:47.076	f	\N	t
238	3	53	48	2025-09-13 12:30:00	3	2	4	FINISHED	t	2025-10-08 18:35:32.407	2025-10-11 17:14:47.076	f	\N	t
239	3	58	57	2025-09-13 12:30:00	3	3	3	FINISHED	t	2025-10-08 18:35:32.408	2025-10-11 17:14:47.076	f	\N	t
240	3	41	45	2025-09-13 15:30:00	3	5	0	FINISHED	t	2025-10-08 18:35:32.408	2025-10-11 17:14:47.076	f	\N	t
241	3	46	56	2025-09-14 14:30:00	3	0	4	FINISHED	t	2025-10-08 18:35:32.409	2025-10-11 17:14:47.076	f	\N	t
242	3	42	54	2025-09-20 12:30:00	4	1	4	FINISHED	t	2025-10-08 18:35:32.41	2025-10-11 17:14:47.076	f	\N	t
243	3	45	47	2025-09-20 12:30:00	4	2	1	FINISHED	t	2025-10-08 18:35:32.41	2025-10-11 17:14:47.076	f	\N	t
244	3	48	41	2025-09-20 12:30:00	4	1	4	FINISHED	t	2025-10-08 18:35:32.411	2025-10-11 17:14:47.076	f	\N	t
245	3	56	50	2025-09-20 12:30:00	4	0	3	FINISHED	t	2025-10-08 18:35:32.412	2025-10-11 17:14:47.076	f	\N	t
246	3	52	57	2025-09-20 15:30:00	4	3	1	FINISHED	t	2025-10-08 18:35:32.412	2025-10-11 17:14:47.076	f	\N	t
247	3	44	53	2025-09-21 12:30:00	4	3	4	FINISHED	t	2025-10-08 18:35:32.413	2025-10-11 17:14:47.076	f	\N	t
248	3	43	46	2025-09-21 14:30:00	4	1	1	FINISHED	t	2025-10-08 18:35:32.413	2025-10-11 17:14:47.076	f	\N	t
249	3	51	58	2025-09-21 16:30:00	4	1	0	FINISHED	t	2025-10-08 18:35:32.414	2025-10-11 17:14:47.076	f	\N	t
250	3	41	56	2025-09-26 17:30:00	5	4	0	FINISHED	t	2025-10-08 18:35:32.415	2025-10-11 17:14:47.076	f	\N	t
251	3	47	42	2025-09-27 12:30:00	5	2	1	FINISHED	t	2025-10-08 18:35:32.415	2025-10-11 17:14:47.076	f	\N	t
252	3	54	51	2025-09-27 12:30:00	5	0	2	FINISHED	t	2025-10-08 18:35:32.416	2025-10-11 17:14:47.076	f	\N	t
254	3	46	44	2025-09-27 15:30:00	5	4	6	FINISHED	t	2025-10-08 18:35:32.418	2025-10-11 17:14:47.076	f	\N	t
255	3	50	48	2025-09-28 12:30:00	5	1	1	FINISHED	t	2025-10-08 18:35:32.418	2025-10-11 17:14:47.076	f	\N	t
27	1	15	6	2025-08-15 18:00:00	1	4	2	FINISHED	t	2025-10-08 10:27:39.086	2025-10-11 17:14:35.552	f	\N	t
1627	2	26	22	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.963	2025-10-24 22:10:56.963	f	\N	f
1628	2	33	36	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.966	2025-10-24 22:10:56.966	f	\N	f
1629	2	23	29	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.968	2025-10-24 22:10:56.968	f	\N	f
1630	2	30	27	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.969	2025-10-24 22:10:56.969	f	\N	f
1631	2	34	40	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.971	2025-10-24 22:10:56.971	f	\N	f
1632	2	38	39	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.972	2025-10-24 22:10:56.972	f	\N	f
1633	2	37	31	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.975	2025-10-24 22:10:56.975	f	\N	f
1634	2	21	28	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.976	2025-10-24 22:10:56.976	f	\N	f
1635	2	35	24	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.978	2025-10-24 22:10:56.978	f	\N	f
1636	2	25	32	2025-11-30 00:00:00	14	\N	\N	SCHEDULED	f	2025-10-24 22:10:56.979	2025-10-24 22:10:56.979	f	\N	f
360	2	23	22	2025-10-25 12:00:00	10	3	3	FINISHED	t	2025-10-18 11:21:07.353	2025-10-27 21:01:54.921	f	\N	f
361	2	36	32	2025-10-25 14:15:00	10	1	0	FINISHED	f	2025-10-18 11:21:26.929	2025-10-27 21:01:54.922	f	\N	f
362	2	28	25	2025-10-25 16:30:00	10	0	1	FINISHED	f	2025-10-18 11:21:47.638	2025-10-27 21:01:54.923	f	\N	f
363	2	40	39	2025-10-25 19:00:00	10	0	2	FINISHED	f	2025-10-18 11:22:04.82	2025-10-27 21:01:54.923	f	\N	f
364	2	30	21	2025-10-26 13:00:00	10	1	1	FINISHED	f	2025-10-18 11:22:32.703	2025-10-27 21:01:54.924	f	\N	f
365	2	29	37	2025-10-26 15:15:00	10	2	1	FINISHED	f	2025-10-18 11:22:51.312	2025-10-27 21:01:54.925	f	\N	f
310	2	40	28	2025-09-20 16:11:00	5	2	0	FINISHED	f	2025-10-11 16:11:43.353	2025-10-11 17:14:47	f	\N	t
329	2	36	24	2025-10-05 16:27:00	8	1	2	FINISHED	f	2025-10-11 16:28:09.153	2025-10-11 17:14:47	f	\N	t
294	2	24	31	2025-08-22 15:51:00	2	1	0	FINISHED	f	2025-10-11 15:51:10.993	2025-10-11 17:14:47	f	\N	t
295	2	26	32	2025-08-23 15:52:00	2	1	1	FINISHED	f	2025-10-11 15:52:02.863	2025-10-11 17:14:47	f	\N	t
296	2	38	36	2025-08-24 15:52:00	2	2	2	FINISHED	f	2025-10-11 15:52:21.066	2025-10-11 17:14:47	f	\N	t
298	2	28	34	2025-08-25 15:54:00	2	1	0	FINISHED	f	2025-10-11 15:54:05.617	2025-10-11 17:14:47	f	\N	t
309	2	31	35	2025-09-20 16:11:00	5	1	2	FINISHED	f	2025-10-11 16:11:15.56	2025-10-11 17:14:47	f	\N	t
312	2	34	33	2025-09-21 16:13:00	5	1	1	FINISHED	f	2025-10-11 16:13:35.832	2025-10-11 17:14:47	f	\N	t
313	2	30	26	2025-09-21 16:13:00	5	1	1	FINISHED	f	2025-10-11 16:13:48.823	2025-10-11 17:14:47	f	\N	t
328	2	31	32	2025-10-05 16:27:00	8	3	1	FINISHED	f	2025-10-11 16:27:47.937	2025-10-11 17:14:47	f	\N	t
330	2	33	26	2025-10-05 16:28:00	8	1	1	FINISHED	f	2025-10-11 16:28:28.031	2025-10-11 17:14:47	f	\N	t
261	3	43	53	2025-10-04 12:30:00	6	2	0	FINISHED	t	2025-10-08 18:35:32.422	2025-10-11 17:14:47.076	f	\N	t
279	3	49	51	2025-08-23 15:10:00	1	3	3	FINISHED	f	2025-10-11 15:10:32.575	2025-10-11 17:14:47.076	f	\N	t
262	3	44	41	2025-10-04 15:30:00	6	0	3	FINISHED	t	2025-10-08 18:35:32.423	2025-10-11 17:14:47.076	f	\N	t
256	3	57	55	2025-09-28 14:30:00	5	1	2	FINISHED	t	2025-10-08 18:35:32.419	2025-10-11 17:14:47.076	f	\N	t
257	3	53	45	2025-09-28 16:30:00	5	0	0	FINISHED	t	2025-10-08 18:35:32.419	2025-10-11 17:14:47.076	f	\N	t
283	3	49	43	2025-09-27 15:17:00	5	1	2	FINISHED	f	2025-10-11 15:17:39.876	2025-10-11 17:14:47.076	f	\N	t
258	3	48	57	2025-10-03 17:30:00	6	0	1	FINISHED	t	2025-10-08 18:35:32.42	2025-10-11 17:14:47.076	f	\N	t
259	3	42	58	2025-10-04 12:30:00	6	3	1	FINISHED	t	2025-10-08 18:35:32.421	2025-10-11 17:14:47.076	f	\N	t
260	3	51	52	2025-10-04 12:30:00	6	1	1	FINISHED	t	2025-10-08 18:35:32.421	2025-10-11 17:14:47.076	f	\N	t
263	3	55	47	2025-10-05 12:30:00	6	1	0	FINISHED	t	2025-10-08 18:35:32.423	2025-10-11 17:14:47.076	f	\N	t
264	3	45	54	2025-10-05 14:30:00	6	4	0	FINISHED	t	2025-10-08 18:35:32.424	2025-10-11 17:14:47.076	f	\N	t
265	3	46	50	2025-10-05 16:30:00	6	0	0	FINISHED	t	2025-10-08 18:35:32.425	2025-10-11 17:14:47.076	f	\N	t
284	3	56	49	2025-10-04 15:19:00	6	1	0	FINISHED	f	2025-10-11 15:19:25.141	2025-10-11 17:14:47.076	f	\N	t
285	3	53	46	2025-10-17 18:30:00	7	3	1	FINISHED	t	2025-10-11 15:20:43.728	2025-10-18 00:04:30.899	f	\N	t
366	2	27	33	2025-10-26 17:30:00	10	2	3	FINISHED	f	2025-10-18 11:23:14.817	2025-10-27 21:01:54.926	f	\N	f
367	2	34	31	2025-10-26 20:00:00	10	1	0	FINISHED	f	2025-10-18 11:23:30.477	2025-10-27 21:01:54.926	f	\N	f
266	1	14	10	2025-10-18 11:30:00	8	0	3	FINISHED	t	2025-10-11 14:18:11.403	2025-10-19 17:33:48.19	f	\N	f
269	1	17	6	2025-10-18 14:00:00	8	3	3	FINISHED	t	2025-10-11 14:21:39.463	2025-10-19 17:33:57.375	f	\N	f
268	1	7	13	2025-10-18 14:00:00	8	2	0	FINISHED	t	2025-10-11 14:21:18.478	2025-10-19 17:34:10.59	f	\N	f
270	1	19	8	2025-10-18 14:00:00	8	2	0	FINISHED	t	2025-10-11 14:21:56.797	2025-10-19 17:34:18.465	f	\N	f
267	1	1	16	2025-10-18 14:00:00	8	2	1	FINISHED	t	2025-10-11 14:18:42.196	2025-10-19 17:37:44.906	f	\N	f
286	3	57	42	2025-10-18 13:30:00	7	1	1	FINISHED	t	2025-10-11 15:21:25.457	2025-10-19 18:10:34.497	f	\N	f
287	3	47	56	2025-10-18 13:30:00	7	2	2	FINISHED	t	2025-10-11 15:21:51.776	2025-10-19 18:10:42.243	f	\N	f
28	1	20	16	2025-08-16 10:30:00	1	0	0	FINISHED	t	2025-10-08 10:27:39.098	2025-10-11 17:14:35.552	f	\N	t
29	1	1	9	2025-08-16 13:00:00	1	1	1	FINISHED	t	2025-10-08 10:27:39.099	2025-10-11 17:14:35.552	f	\N	t
30	1	3	2	2025-08-16 13:00:00	1	3	0	FINISHED	t	2025-10-08 10:27:39.101	2025-10-11 17:14:35.552	f	\N	t
31	1	4	7	2025-08-16 13:00:00	1	3	0	FINISHED	t	2025-10-08 10:27:39.103	2025-10-11 17:14:35.552	f	\N	t
32	1	18	19	2025-08-16 15:30:00	1	0	4	FINISHED	t	2025-10-08 10:27:39.105	2025-10-11 17:14:35.552	f	\N	t
33	1	10	17	2025-08-17 12:00:00	1	0	0	FINISHED	t	2025-10-08 10:27:39.105	2025-10-11 17:14:35.552	f	\N	t
34	1	14	12	2025-08-17 12:00:00	1	3	1	FINISHED	t	2025-10-08 10:27:39.106	2025-10-11 17:14:35.552	f	\N	t
35	1	11	5	2025-08-17 14:30:00	1	0	1	FINISHED	t	2025-10-08 10:27:39.107	2025-10-11 17:14:35.552	f	\N	t
36	1	13	8	2025-08-18 18:00:00	1	1	0	FINISHED	t	2025-10-08 10:27:39.107	2025-10-11 17:14:35.552	f	\N	t
281	3	49	42	2025-09-14 15:14:00	3	2	1	FINISHED	f	2025-10-11 15:14:38.495	2025-10-11 17:14:47.076	f	\N	t
282	3	55	49	2025-09-19 15:16:00	4	2	0	FINISHED	f	2025-10-11 15:16:22.349	2025-10-11 17:14:47.076	f	\N	t
218	3	41	52	2025-08-22 17:30:00	1	6	0	FINISHED	t	2025-10-08 18:35:32.385	2025-10-11 17:14:47.076	f	\N	t
253	3	58	52	2025-09-27 12:30:00	5	0	1	FINISHED	t	2025-10-08 18:35:32.417	2025-10-11 17:14:47.076	f	\N	t
280	3	45	49	2025-08-29 15:12:00	2	0	2	FINISHED	f	2025-10-11 15:12:43.518	2025-10-11 17:14:47.076	f	\N	t
331	2	22	36	2025-10-17 19:00:00	9	0	2	FINISHED	t	2025-10-11 16:31:24.396	2025-10-18 11:10:43.36	f	\N	t
274	1	15	11	2025-10-19 15:30:00	8	1	2	FINISHED	t	2025-10-11 14:23:25.192	2025-10-19 17:38:30.745	f	\N	t
273	1	4	20	2025-10-19 13:00:00	8	1	2	FINISHED	t	2025-10-11 14:23:05.707	2025-10-19 17:38:33.786	f	\N	t
272	1	9	5	2025-10-18 16:30:00	8	0	1	FINISHED	t	2025-10-11 14:22:47.342	2025-10-19 17:38:36.607	f	\N	t
271	1	3	18	2025-10-18 14:00:00	8	2	0	FINISHED	t	2025-10-11 14:22:22.24	2025-10-19 17:38:40.831	f	\N	t
332	2	35	30	2025-10-18 12:00:00	9	1	3	FINISHED	t	2025-10-11 16:32:00.569	2025-10-19 17:55:25.59	f	\N	f
333	2	37	23	2025-10-18 14:15:00	9	2	1	FINISHED	t	2025-10-11 16:32:29.992	2025-10-19 17:55:33.148	f	\N	f
1637	3	56	53	2025-10-24 18:30:00	8	1	0	FINISHED	f	2025-10-24 22:12:06.563	2025-10-27 20:53:38.839	f	\N	f
1638	3	44	49	2025-10-25 13:30:00	8	2	0	FINISHED	f	2025-10-24 22:12:06.57	2025-10-27 20:53:38.84	f	\N	f
1640	3	42	52	2025-10-25 13:30:00	8	0	6	FINISHED	f	2025-10-24 22:12:06.573	2025-10-27 20:53:38.841	f	\N	f
1641	3	48	47	2025-10-25 13:30:00	8	3	1	FINISHED	f	2025-10-24 22:12:06.575	2025-10-27 20:53:38.842	f	\N	f
1642	3	45	58	2025-10-25 13:30:00	8	0	1	FINISHED	f	2025-10-24 22:12:06.576	2025-10-27 20:53:38.842	f	\N	f
1639	3	46	41	2025-10-25 13:45:00	8	0	3	FINISHED	f	2025-10-24 22:12:06.571	2025-10-27 20:53:38.843	f	\N	f
1643	3	51	57	2025-10-25 16:30:00	8	1	0	FINISHED	f	2025-10-24 22:12:06.578	2025-10-27 20:53:38.844	f	\N	f
1644	3	43	50	2025-10-26 14:30:00	8	2	0	FINISHED	f	2025-10-24 22:12:06.58	2025-10-27 20:53:38.845	f	\N	f
1645	3	55	54	2025-10-26 16:30:00	8	2	1	FINISHED	f	2025-10-24 22:12:06.582	2025-10-27 20:53:38.845	f	\N	f
368	2	24	26	2025-10-27 20:00:00	10	0	2	FINISHED	f	2025-10-18 11:23:49.581	2025-10-27 21:49:38.485	f	\N	t
38	1	19	4	2025-08-23 10:30:00	2	0	2	FINISHED	t	2025-10-08 10:27:39.108	2025-10-11 17:14:35.552	f	\N	t
39	1	6	18	2025-08-23 13:00:00	2	1	0	FINISHED	t	2025-10-08 10:27:39.109	2025-10-11 17:14:35.552	f	\N	t
40	1	12	20	2025-08-23 13:00:00	2	1	0	FINISHED	t	2025-10-08 10:27:39.11	2025-10-11 17:14:35.552	f	\N	t
41	1	7	3	2025-08-23 13:00:00	2	2	0	FINISHED	t	2025-10-08 10:27:39.11	2025-10-11 17:14:35.552	f	\N	t
42	1	5	13	2025-08-23 15:30:00	2	5	0	FINISHED	t	2025-10-08 10:27:39.111	2025-10-11 17:14:35.552	f	\N	t
43	1	17	14	2025-08-24 12:00:00	2	1	1	FINISHED	t	2025-10-08 10:27:39.111	2025-10-11 17:14:35.552	f	\N	t
44	1	8	1	2025-08-24 12:00:00	2	2	0	FINISHED	t	2025-10-08 10:27:39.112	2025-10-11 17:14:35.552	f	\N	t
45	1	9	11	2025-08-24 14:30:00	2	1	1	FINISHED	t	2025-10-08 10:27:39.113	2025-10-11 17:14:35.552	f	\N	t
46	1	16	15	2025-08-25 18:00:00	2	2	3	FINISHED	t	2025-10-08 10:27:39.113	2025-10-11 17:14:35.552	f	\N	t
47	1	10	9	2025-08-30 10:30:00	3	2	0	FINISHED	t	2025-10-08 10:27:39.114	2025-10-11 17:14:35.552	f	\N	t
48	1	11	7	2025-08-30 13:00:00	3	3	2	FINISHED	t	2025-10-08 10:27:39.114	2025-10-11 17:14:35.552	f	\N	t
49	1	3	12	2025-08-30 13:00:00	3	2	1	FINISHED	t	2025-10-08 10:27:39.115	2025-10-11 17:14:35.552	f	\N	t
50	1	4	6	2025-08-30 13:00:00	3	0	1	FINISHED	t	2025-10-08 10:27:39.115	2025-10-11 17:14:35.552	f	\N	t
37	1	2	10	2025-08-22 18:00:00	2	1	5	FINISHED	t	2025-10-08 10:27:39.108	2025-10-11 17:14:35.552	f	\N	t
214	2	23	40	2025-10-04 13:15:00	8	2	1	FINISHED	t	2025-10-08 10:31:21.964	2025-10-11 17:14:47	f	\N	t
226	3	48	44	2025-08-30 12:30:00	2	1	3	FINISHED	t	2025-10-08 18:35:32.399	2025-10-11 17:14:47.076	f	\N	t
334	2	39	24	2025-10-18 16:30:00	9	2	2	FINISHED	t	2025-10-11 16:32:53.568	2025-10-19 17:55:41.451	f	\N	f
335	2	26	27	2025-10-18 19:00:00	9	1	0	FINISHED	t	2025-10-11 16:33:11.752	2025-10-19 17:55:48.209	f	\N	f
370	1	16	9	2025-10-25 14:00:00	9	2	1	FINISHED	f	2025-10-18 11:28:04.996	2025-10-27 20:54:27.734	f	\N	f
1646	4	63	76	2025-08-29 16:30:00	2	3	2	FINISHED	f	2025-10-24 22:17:41.438	2025-10-27 20:57:47.232	f	\N	f
369	1	13	2	2025-10-24 19:00:00	9	2	1	FINISHED	t	2025-10-18 11:27:45.075	2025-10-27 20:54:27.732	f	\N	f
371	1	10	3	2025-10-25 14:00:00	9	1	2	FINISHED	f	2025-10-18 11:28:30.555	2025-10-27 20:54:27.733	f	\N	f
336	2	32	28	2025-10-19 12:00:00	9	0	0	FINISHED	t	2025-10-11 16:33:34.109	2025-10-19 17:55:56.684	f	\N	f
337	2	33	38	2025-10-19 14:15:00	9	1	1	FINISHED	t	2025-10-11 16:33:58.336	2025-10-19 17:56:05.422	f	\N	f
338	2	21	34	2025-10-19 16:30:00	9	0	2	FINISHED	t	2025-10-11 16:34:19.367	2025-10-19 17:56:12.075	f	\N	f
288	3	54	43	2025-10-18 13:30:00	7	3	4	FINISHED	t	2025-10-11 15:22:27.539	2025-10-19 18:10:50.861	f	\N	f
289	3	52	45	2025-10-18 13:30:00	7	2	1	FINISHED	t	2025-10-11 15:22:53.809	2025-10-19 18:11:08.502	f	\N	f
290	3	58	55	2025-10-18 13:30:00	7	0	3	FINISHED	t	2025-10-11 15:23:17.862	2025-10-19 18:11:14.673	f	\N	f
291	3	41	51	2025-10-18 16:30:00	7	2	1	FINISHED	t	2025-10-11 15:23:40.556	2025-10-19 18:11:21.83	f	\N	f
372	1	11	1	2025-10-25 16:30:00	9	4	2	FINISHED	f	2025-10-18 11:28:47.153	2025-10-27 20:54:27.735	f	\N	f
51	1	18	8	2025-08-30 13:00:00	3	2	3	FINISHED	t	2025-10-08 10:27:39.116	2025-10-11 17:14:35.552	f	\N	t
52	1	13	16	2025-08-30 15:30:00	3	0	0	FINISHED	t	2025-10-08 10:27:39.117	2025-10-11 17:14:35.552	f	\N	t
53	1	1	19	2025-08-31 12:00:00	3	2	1	FINISHED	t	2025-10-08 10:27:39.118	2025-10-11 17:14:35.552	f	\N	t
292	3	50	44	2025-10-19 13:30:00	7	2	2	FINISHED	t	2025-10-11 15:24:08.143	2025-10-19 18:11:28.594	f	\N	f
293	3	49	48	2025-10-19 15:30:00	7	0	3	FINISHED	t	2025-10-11 15:24:40.183	2025-10-19 18:11:36.057	f	\N	f
1647	4	70	71	2025-08-29 18:45:00	2	0	2	FINISHED	f	2025-10-24 22:17:41.444	2025-10-27 20:57:47.233	f	\N	f
1648	4	60	62	2025-08-30 16:30:00	2	1	0	FINISHED	f	2025-10-24 22:17:41.446	2025-10-27 20:57:47.234	f	\N	f
1649	4	73	59	2025-08-30 16:30:00	2	1	1	FINISHED	f	2025-10-24 22:17:41.447	2025-10-27 20:57:47.235	f	\N	f
1650	4	72	61	2025-08-30 18:45:00	2	1	0	FINISHED	f	2025-10-24 22:17:41.449	2025-10-27 20:57:47.235	f	\N	f
54	1	14	2	2025-08-31 12:00:00	3	0	3	FINISHED	t	2025-10-08 10:27:39.119	2025-10-11 17:14:35.552	f	\N	t
55	1	15	5	2025-08-31 14:30:00	3	1	0	FINISHED	t	2025-10-08 10:27:39.12	2025-10-11 17:14:35.552	f	\N	t
1651	4	74	75	2025-08-30 18:45:00	2	0	1	FINISHED	f	2025-10-24 22:17:41.451	2025-10-27 20:57:47.236	f	\N	f
340	2	31	40	2025-10-20 19:00:00	9	0	0	FINISHED	t	2025-10-11 16:34:58.112	2025-10-24 22:03:28.308	f	\N	f
1652	4	65	68	2025-08-31 16:30:00	2	0	1	FINISHED	f	2025-10-24 22:17:41.452	2025-10-27 20:57:47.237	f	\N	f
1653	4	77	64	2025-08-31 16:30:00	2	0	0	FINISHED	f	2025-10-24 22:17:41.454	2025-10-27 20:57:47.237	f	\N	f
1654	4	67	78	2025-08-31 18:45:00	2	1	2	FINISHED	f	2025-10-24 22:17:41.455	2025-10-27 20:57:47.238	f	\N	f
1655	4	69	66	2025-08-31 18:45:00	2	4	0	FINISHED	f	2025-10-24 22:17:41.457	2025-10-27 20:57:47.239	f	\N	f
56	1	20	17	2025-08-31 17:00:00	3	0	3	FINISHED	t	2025-10-08 10:27:39.12	2025-10-11 17:14:35.552	f	\N	t
57	1	5	14	2025-09-13 10:30:00	4	3	0	FINISHED	t	2025-10-08 10:27:39.121	2025-10-11 17:14:35.552	f	\N	t
58	1	6	1	2025-09-13 13:00:00	4	2	1	FINISHED	t	2025-10-08 10:27:39.122	2025-10-11 17:14:35.552	f	\N	t
59	1	17	3	2025-09-13 13:00:00	4	0	0	FINISHED	t	2025-10-08 10:27:39.122	2025-10-11 17:14:35.552	f	\N	t
60	1	8	20	2025-09-13 13:00:00	4	0	0	FINISHED	t	2025-10-08 10:27:39.123	2025-10-11 17:14:35.552	f	\N	t
215	2	29	39	2025-10-04 18:00:00	8	3	1	FINISHED	t	2025-10-08 10:31:21.965	2025-10-11 17:14:47	f	\N	t
61	1	9	13	2025-09-13 13:00:00	4	1	0	FINISHED	t	2025-10-08 10:27:39.123	2025-10-11 17:14:35.552	f	\N	t
62	1	16	18	2025-09-13 13:00:00	4	1	0	FINISHED	t	2025-10-08 10:27:39.124	2025-10-11 17:14:35.552	f	\N	t
63	1	2	4	2025-09-13 15:30:00	4	0	3	FINISHED	t	2025-10-08 10:27:39.125	2025-10-11 17:14:35.552	f	\N	t
64	1	12	10	2025-09-13 18:00:00	4	2	2	FINISHED	t	2025-10-08 10:27:39.125	2025-10-11 17:14:35.552	f	\N	t
65	1	7	15	2025-09-14 12:00:00	4	0	1	FINISHED	t	2025-10-08 10:27:39.127	2025-10-11 17:14:35.552	f	\N	t
66	1	19	11	2025-09-14 14:30:00	4	3	0	FINISHED	t	2025-10-08 10:27:39.127	2025-10-11 17:14:35.552	f	\N	t
67	1	15	8	2025-09-20 10:30:00	5	2	1	FINISHED	t	2025-10-08 10:27:39.128	2025-10-11 17:14:35.552	f	\N	t
68	1	1	4	2025-09-20 13:00:00	5	2	2	FINISHED	t	2025-10-08 10:27:39.128	2025-10-11 17:14:35.552	f	\N	t
69	1	7	14	2025-09-20 13:00:00	5	1	1	FINISHED	t	2025-10-08 10:27:39.129	2025-10-11 17:14:35.552	f	\N	t
70	1	2	17	2025-09-20 13:00:00	5	1	2	FINISHED	t	2025-10-08 10:27:39.13	2025-10-11 17:14:35.552	f	\N	t
71	1	18	13	2025-09-20 13:00:00	5	1	3	FINISHED	t	2025-10-08 10:27:39.13	2025-10-11 17:14:35.552	f	\N	t
72	1	11	10	2025-09-20 15:30:00	5	2	1	FINISHED	t	2025-10-08 10:27:39.131	2025-10-11 17:14:35.552	f	\N	t
73	1	9	12	2025-09-20 18:00:00	5	3	1	FINISHED	t	2025-10-08 10:27:39.132	2025-10-11 17:14:35.552	f	\N	t
74	1	6	16	2025-09-21 12:00:00	5	0	0	FINISHED	t	2025-10-08 10:27:39.132	2025-10-11 17:14:35.552	f	\N	t
75	1	3	20	2025-09-21 12:00:00	5	1	1	FINISHED	t	2025-10-08 10:27:39.133	2025-10-11 17:14:35.552	f	\N	t
76	1	5	19	2025-09-21 14:30:00	5	1	1	FINISHED	t	2025-10-08 10:27:39.135	2025-10-11 17:14:35.552	f	\N	t
77	1	12	11	2025-09-27 10:30:00	6	3	1	FINISHED	t	2025-10-08 10:27:39.136	2025-10-11 17:14:35.552	f	\N	t
78	1	10	1	2025-09-27 13:00:00	6	1	3	FINISHED	t	2025-10-08 10:27:39.137	2025-10-11 17:14:35.552	f	\N	t
79	1	17	15	2025-09-27 13:00:00	6	2	1	FINISHED	t	2025-10-08 10:27:39.137	2025-10-11 17:14:35.552	f	\N	t
80	1	13	6	2025-09-27 13:00:00	6	2	2	FINISHED	t	2025-10-08 10:27:39.138	2025-10-11 17:14:35.552	f	\N	t
81	1	19	7	2025-09-27 13:00:00	6	5	1	FINISHED	t	2025-10-08 10:27:39.138	2025-10-11 17:14:35.552	f	\N	t
216	2	35	37	2025-10-05 13:15:00	8	4	1	FINISHED	t	2025-10-08 10:31:21.966	2025-10-11 17:14:47	f	\N	t
217	2	38	34	2025-10-05 15:30:00	8	0	1	FINISHED	t	2025-10-08 10:31:21.966	2025-10-11 17:14:47	f	\N	t
325	2	27	25	2025-10-03 16:26:00	8	2	1	FINISHED	f	2025-10-11 16:27:01.029	2025-10-11 17:14:47	f	\N	t
326	2	22	21	2025-10-04 16:27:00	8	0	2	FINISHED	f	2025-10-11 16:27:18.752	2025-10-11 17:14:47	f	\N	t
327	2	28	30	2025-10-04 16:27:00	8	2	1	FINISHED	f	2025-10-11 16:27:32.956	2025-10-11 17:14:47	f	\N	t
82	1	14	3	2025-09-27 15:30:00	6	0	1	FINISHED	t	2025-10-08 10:27:39.139	2025-10-11 17:14:35.552	f	\N	t
83	1	4	18	2025-09-27 18:00:00	6	1	1	FINISHED	t	2025-10-08 10:27:39.139	2025-10-11 17:14:35.552	f	\N	t
84	1	20	9	2025-09-28 12:00:00	6	3	1	FINISHED	t	2025-10-08 10:27:39.14	2025-10-11 17:14:35.552	f	\N	t
85	1	16	5	2025-09-28 14:30:00	6	1	2	FINISHED	t	2025-10-08 10:27:39.141	2025-10-11 17:14:35.552	f	\N	t
86	1	8	2	2025-09-29 18:00:00	6	1	1	FINISHED	t	2025-10-08 10:27:39.141	2025-10-11 17:14:35.552	f	\N	t
87	1	6	9	2025-10-03 18:00:00	7	3	1	FINISHED	t	2025-10-08 10:27:39.142	2025-10-11 17:14:35.552	f	\N	t
88	1	13	4	2025-10-04 10:30:00	7	1	2	FINISHED	t	2025-10-08 10:27:39.142	2025-10-11 17:14:35.552	f	\N	t
89	1	5	2	2025-10-04 13:00:00	7	2	0	FINISHED	t	2025-10-08 10:27:39.143	2025-10-11 17:14:35.552	f	\N	t
90	1	11	3	2025-10-04 13:00:00	7	2	0	FINISHED	t	2025-10-08 10:27:39.143	2025-10-11 17:14:35.552	f	\N	t
91	1	10	15	2025-10-04 15:30:00	7	2	1	FINISHED	t	2025-10-08 10:27:39.144	2025-10-11 17:14:35.552	f	\N	t
92	1	20	7	2025-10-05 12:00:00	7	2	1	FINISHED	t	2025-10-08 10:27:39.144	2025-10-11 17:14:35.552	f	\N	t
93	1	8	17	2025-10-05 12:00:00	7	2	1	FINISHED	t	2025-10-08 10:27:39.145	2025-10-11 17:14:35.552	f	\N	t
94	1	16	14	2025-10-05 12:00:00	7	2	0	FINISHED	t	2025-10-08 10:27:39.146	2025-10-11 17:14:35.552	f	\N	t
95	1	18	1	2025-10-05 12:00:00	7	1	1	FINISHED	t	2025-10-08 10:27:39.146	2025-10-11 17:14:35.552	f	\N	t
96	1	12	19	2025-10-05 14:30:00	7	0	1	FINISHED	t	2025-10-08 10:27:39.147	2025-10-11 17:14:35.552	f	\N	t
170	2	40	38	2025-08-16 18:30:00	1	1	1	FINISHED	t	2025-10-08 10:31:21.926	2025-10-11 17:14:47	f	\N	t
171	2	33	25	2025-08-17 14:00:00	1	0	2	FINISHED	t	2025-10-08 10:31:21.927	2025-10-11 17:14:47	f	\N	t
172	2	32	24	2025-08-18 18:00:00	1	1	1	FINISHED	t	2025-10-08 10:31:21.928	2025-10-11 17:14:47	f	\N	t
173	2	29	27	2025-08-19 18:00:00	1	1	0	FINISHED	t	2025-10-08 10:31:21.929	2025-10-11 17:14:47	f	\N	t
174	2	30	33	2025-08-23 14:00:00	2	1	1	FINISHED	t	2025-10-08 10:31:21.93	2025-10-11 17:14:47	f	\N	t
175	2	21	37	2025-08-23 18:30:00	2	2	3	FINISHED	t	2025-10-08 10:31:21.931	2025-10-11 17:14:47	f	\N	t
195	2	24	38	2025-09-19 18:00:00	5	3	1	FINISHED	t	2025-10-08 10:31:21.944	2025-10-11 17:14:47	f	\N	t
197	2	39	27	2025-09-20 15:30:00	5	2	1	FINISHED	t	2025-10-08 10:31:21.946	2025-10-11 17:14:47	f	\N	t
199	2	32	22	2025-09-21 15:30:00	5	1	0	FINISHED	t	2025-10-08 10:31:21.947	2025-10-11 17:14:47	f	\N	t
200	2	37	25	2025-09-21 18:00:00	5	3	0	FINISHED	t	2025-10-08 10:31:21.948	2025-10-11 17:14:47	f	\N	t
167	2	23	34	2025-08-15 16:00:00	1	1	3	FINISHED	t	2025-10-08 10:31:21.92	2025-10-11 17:14:47	f	\N	t
168	2	39	22	2025-08-15 18:30:00	1	2	0	FINISHED	t	2025-10-08 10:31:21.924	2025-10-11 17:14:47	f	\N	t
169	2	30	37	2025-08-16 16:30:00	1	0	3	FINISHED	t	2025-10-08 10:31:21.925	2025-10-11 17:14:47	f	\N	t
176	2	27	40	2025-08-24 14:00:00	2	1	0	FINISHED	t	2025-10-08 10:31:21.931	2025-10-11 17:14:47	f	\N	t
177	2	39	23	2025-08-24 16:30:00	2	5	0	FINISHED	t	2025-10-08 10:31:21.932	2025-10-11 17:14:47	f	\N	t
178	2	22	29	2025-08-24 18:30:00	2	0	3	FINISHED	t	2025-10-08 10:31:21.933	2025-10-11 17:14:47	f	\N	t
179	2	35	25	2025-08-25 18:30:00	2	1	2	FINISHED	t	2025-10-08 10:31:21.934	2025-10-11 17:14:47	f	\N	t
181	2	32	21	2025-08-29 16:30:00	3	2	0	FINISHED	t	2025-10-08 10:31:21.935	2025-10-11 17:14:47	f	\N	t
182	2	40	25	2025-08-29 18:30:00	3	3	0	FINISHED	t	2025-10-08 10:31:21.936	2025-10-11 17:14:47	f	\N	t
183	2	22	38	2025-08-30 16:00:00	3	1	0	FINISHED	t	2025-10-08 10:31:21.936	2025-10-11 17:14:47	f	\N	t
184	2	23	35	2025-08-30 16:30:00	3	0	2	FINISHED	t	2025-10-08 10:31:21.937	2025-10-11 17:14:47	f	\N	t
185	2	29	30	2025-08-30 18:30:00	3	2	1	FINISHED	t	2025-10-08 10:31:21.937	2025-10-11 17:14:47	f	\N	t
187	2	34	37	2025-08-31 18:30:00	3	1	1	FINISHED	t	2025-10-08 10:31:21.939	2025-10-11 17:14:47	f	\N	t
299	2	31	26	2025-08-30 16:01:00	3	1	1	FINISHED	f	2025-10-11 16:01:21.474	2025-10-11 17:14:47	f	\N	t
300	2	33	39	2025-08-31 16:02:00	3	1	1	FINISHED	f	2025-10-11 16:02:04.954	2025-10-11 17:14:47	f	\N	t
301	2	24	28	2025-08-31 16:02:00	3	1	2	FINISHED	f	2025-10-11 16:02:23.018	2025-10-11 17:14:47	f	\N	t
302	2	36	27	2025-08-31 16:02:00	3	1	0	FINISHED	f	2025-10-11 16:02:41.273	2025-10-11 17:14:47	f	\N	t
188	2	35	32	2025-09-12 18:00:00	4	2	2	FINISHED	t	2025-10-08 10:31:21.939	2025-10-11 17:14:47	f	\N	t
189	2	25	22	2025-09-13 11:00:00	4	2	0	FINISHED	t	2025-10-08 10:31:21.94	2025-10-11 17:14:47	f	\N	t
190	2	38	29	2025-09-13 13:15:00	4	1	2	FINISHED	t	2025-10-08 10:31:21.941	2025-10-11 17:14:47	f	\N	t
192	2	21	24	2025-09-14 13:15:00	4	2	2	FINISHED	t	2025-10-08 10:31:21.942	2025-10-11 17:14:47	f	\N	t
193	2	27	34	2025-09-14 15:30:00	4	2	0	FINISHED	t	2025-10-08 10:31:21.943	2025-10-11 17:14:47	f	\N	t
194	2	37	40	2025-09-14 18:00:00	4	6	0	FINISHED	t	2025-10-08 10:31:21.943	2025-10-11 17:14:47	f	\N	t
207	2	34	35	2025-09-28 11:00:00	7	0	1	FINISHED	t	2025-10-08 10:31:21.956	2025-10-11 17:14:47	f	\N	t
208	2	32	33	2025-09-28 13:15:00	7	2	1	FINISHED	t	2025-10-08 10:31:21.957	2025-10-11 17:14:47	f	\N	t
210	2	24	27	2025-09-28 18:00:00	7	2	0	FINISHED	t	2025-10-08 10:31:21.959	2025-10-11 17:14:47	f	\N	t
211	2	40	22	2025-09-30 17:00:00	7	1	2	FINISHED	t	2025-10-08 10:31:21.96	2025-10-11 17:14:47	f	\N	t
209	2	37	38	2025-09-28 15:30:00	7	2	1	FINISHED	t	2025-10-08 10:31:21.958	2025-10-11 17:14:47	f	\N	t
202	2	35	39	2025-09-23 18:30:00	6	1	2	FINISHED	t	2025-10-08 10:31:21.95	2025-10-11 17:14:47	f	\N	t
203	2	38	30	2025-09-24 18:30:00	6	1	0	FINISHED	t	2025-10-08 10:31:21.951	2025-10-11 17:14:47	f	\N	t
204	2	27	32	2025-09-25 16:30:00	6	1	1	FINISHED	t	2025-10-08 10:31:21.952	2025-10-11 17:14:47	f	\N	t
205	2	22	37	2025-09-25 18:30:00	6	1	3	FINISHED	t	2025-10-08 10:31:21.953	2025-10-11 17:14:47	f	\N	t
314	2	33	24	2025-08-27 16:18:00	6	1	1	FINISHED	f	2025-10-11 16:18:04.059	2025-10-11 17:14:47	f	\N	t
315	2	36	40	2025-09-23 16:18:00	6	2	2	FINISHED	f	2025-10-11 16:18:40.971	2025-10-11 17:14:47	f	\N	t
316	2	28	23	2025-09-23 16:18:00	6	1	1	FINISHED	f	2025-10-11 16:18:59.328	2025-10-11 17:14:47	f	\N	t
317	2	21	29	2025-09-23 16:19:00	6	1	4	FINISHED	f	2025-10-11 16:19:21.859	2025-10-11 17:14:47	f	\N	t
1656	4	74	66	2025-10-18 13:00:00	7	0	0	FINISHED	f	2025-10-24 23:13:57.426	2025-10-24 23:13:57.426	f	\N	f
319	2	26	34	2025-09-24 16:19:00	6	3	2	FINISHED	f	2025-10-11 16:19:53.665	2025-10-11 17:14:47	f	\N	t
276	2	31	21	2025-08-16 14:27:00	1	2	1	FINISHED	f	2025-10-11 14:28:00.396	2025-10-11 17:14:47	f	\N	t
277	2	36	26	2025-08-17 14:28:00	1	2	1	FINISHED	f	2025-10-11 14:28:25.926	2025-10-11 17:14:47	f	\N	t
278	2	28	35	2025-08-17 14:29:00	1	3	2	FINISHED	f	2025-10-11 14:29:48.186	2025-10-11 17:14:47	f	\N	t
303	2	28	31	2025-09-13 16:06:00	4	0	1	FINISHED	f	2025-10-11 16:06:25.347	2025-10-11 17:14:47	f	\N	t
304	2	26	39	2025-09-13 16:06:00	4	2	0	FINISHED	f	2025-10-11 16:07:29.873	2025-10-11 17:14:47	f	\N	t
305	2	33	23	2025-09-14 16:07:00	4	1	1	FINISHED	f	2025-10-11 16:07:48.327	2025-10-11 17:14:47	f	\N	t
306	2	36	30	2025-09-15 16:08:00	4	3	2	FINISHED	f	2025-10-11 16:08:07.123	2025-10-11 17:14:47	f	\N	t
307	2	23	21	2025-09-20 16:10:00	5	0	4	FINISHED	f	2025-10-11 16:10:36.864	2025-10-11 17:14:47	f	\N	t
308	2	29	36	2025-09-20 16:10:00	5	2	0	FINISHED	f	2025-10-11 16:10:55.201	2025-10-11 17:14:47	f	\N	t
320	2	23	36	2025-09-26 16:22:00	7	0	0	FINISHED	f	2025-10-11 16:22:47.858	2025-10-11 17:14:47	f	\N	t
321	2	25	21	2025-09-27 16:22:00	7	1	1	FINISHED	f	2025-10-11 16:23:02.819	2025-10-11 17:14:47	f	\N	t
322	2	26	29	2025-09-27 16:23:00	7	5	2	FINISHED	f	2025-10-11 16:23:16.866	2025-10-11 17:14:47	f	\N	t
323	2	30	31	2025-09-27 16:23:00	7	1	0	FINISHED	f	2025-10-11 16:23:30.358	2025-10-11 17:14:47	f	\N	t
324	2	39	28	2025-09-27 16:23:00	7	1	0	FINISHED	f	2025-10-11 16:23:46.517	2025-10-11 17:14:47	f	\N	t
1657	4	70	76	2025-10-18 13:00:00	7	0	0	FINISHED	f	2025-10-24 23:13:57.433	2025-10-24 23:13:57.433	f	\N	f
1658	4	77	72	2025-10-18 16:00:00	7	1	0	FINISHED	f	2025-10-24 23:13:57.435	2025-10-24 23:13:57.435	f	\N	f
1659	4	75	67	2025-10-18 18:45:00	7	0	1	FINISHED	f	2025-10-24 23:13:57.436	2025-10-24 23:13:57.436	f	\N	f
1660	4	62	68	2025-10-19 10:30:00	7	2	0	FINISHED	f	2025-10-24 23:13:57.438	2025-10-24 23:13:57.438	f	\N	f
1661	4	61	60	2025-10-19 13:00:00	7	0	2	FINISHED	f	2025-10-24 23:13:57.439	2025-10-24 23:13:57.439	f	\N	f
1662	4	65	73	2025-10-19 13:00:00	7	0	0	FINISHED	f	2025-10-24 23:13:57.441	2025-10-24 23:13:57.441	f	\N	f
1663	4	59	69	2025-10-19 16:00:00	7	0	0	FINISHED	f	2025-10-24 23:13:57.442	2025-10-24 23:13:57.442	f	\N	f
1664	4	71	64	2025-10-19 18:45:00	7	2	1	FINISHED	f	2025-10-24 23:13:57.443	2025-10-24 23:13:57.443	f	\N	f
1665	4	63	78	2025-10-20 18:45:00	7	1	1	FINISHED	f	2025-10-24 23:13:57.446	2025-10-24 23:13:57.446	f	\N	f
1666	4	71	74	2025-10-24 18:45:00	8	2	2	FINISHED	f	2025-10-24 23:14:33.81	2025-10-27 20:53:17.447	f	\N	f
1667	4	73	62	2025-10-25 13:00:00	8	0	0	FINISHED	f	2025-10-24 23:14:33.815	2025-10-27 20:53:17.449	f	\N	f
1668	4	78	70	2025-10-25 13:00:00	8	3	2	FINISHED	f	2025-10-24 23:14:33.816	2025-10-27 20:53:17.45	f	\N	f
1669	4	72	67	2025-10-25 16:00:00	8	3	1	FINISHED	f	2025-10-24 23:14:33.817	2025-10-27 20:53:17.451	f	\N	f
1670	4	63	59	2025-10-25 18:45:00	8	1	1	FINISHED	f	2025-10-24 23:14:33.818	2025-10-27 20:53:17.451	f	\N	f
1671	4	77	65	2025-10-26 11:30:00	8	2	1	FINISHED	f	2025-10-24 23:14:33.819	2025-10-27 20:53:17.452	f	\N	f
1672	4	66	61	2025-10-26 14:00:00	8	2	2	FINISHED	f	2025-10-24 23:14:33.82	2025-10-27 20:53:17.453	f	\N	f
1673	4	76	75	2025-10-26 14:00:00	8	0	1	FINISHED	f	2025-10-24 23:14:33.821	2025-10-27 20:53:17.454	f	\N	f
1674	4	64	60	2025-10-26 17:00:00	8	2	2	FINISHED	f	2025-10-24 23:14:33.823	2025-10-27 20:53:17.454	f	\N	f
1675	4	69	68	2025-10-26 19:45:00	8	1	0	FINISHED	f	2025-10-24 23:14:33.824	2025-10-27 20:53:17.455	f	\N	f
373	1	12	15	2025-10-25 19:00:00	9	3	2	FINISHED	f	2025-10-18 11:29:03.986	2025-10-27 20:54:27.736	f	\N	f
375	1	6	14	2025-10-26 14:00:00	9	2	0	FINISHED	f	2025-10-18 11:29:37.337	2025-10-27 20:54:27.736	f	\N	f
376	1	20	19	2025-10-26 14:00:00	9	1	0	FINISHED	f	2025-10-18 11:29:59.942	2025-10-27 20:54:27.737	f	\N	f
374	1	5	17	2025-10-26 14:00:00	9	1	0	FINISHED	f	2025-10-18 11:29:17.912	2025-10-27 20:54:27.738	f	\N	f
377	1	18	7	2025-10-26 14:00:00	9	2	3	FINISHED	f	2025-10-18 11:30:16.39	2025-10-27 20:54:27.738	f	\N	f
378	1	8	4	2025-10-26 16:30:00	9	0	3	FINISHED	f	2025-10-18 11:30:32.889	2025-10-27 20:54:27.739	f	\N	f
1686	4	65	70	2025-08-23 16:30:00	1	0	0	FINISHED	f	2025-10-24 23:17:56.317	2025-10-27 20:57:37.844	f	\N	f
1687	4	76	72	2025-08-23 16:30:00	1	0	2	FINISHED	f	2025-10-24 23:17:56.323	2025-10-27 20:57:37.846	f	\N	f
1688	4	71	63	2025-08-23 18:45:00	1	1	2	FINISHED	f	2025-10-24 23:17:56.324	2025-10-27 20:57:37.847	f	\N	f
1689	4	75	60	2025-08-23 18:45:00	1	1	0	FINISHED	f	2025-10-24 23:17:56.325	2025-10-27 20:57:37.848	f	\N	f
1690	4	61	64	2025-08-24 16:30:00	1	1	1	FINISHED	f	2025-10-24 23:17:56.327	2025-10-27 20:57:37.848	f	\N	f
1691	4	62	69	2025-08-24 16:30:00	1	2	0	FINISHED	f	2025-10-24 23:17:56.328	2025-10-27 20:57:37.849	f	\N	f
1692	4	59	74	2025-08-24 18:45:00	1	1	1	FINISHED	f	2025-10-24 23:17:56.329	2025-10-27 20:57:37.85	f	\N	f
1693	4	68	73	2025-08-24 18:45:00	1	2	0	FINISHED	f	2025-10-24 23:17:56.33	2025-10-27 20:57:37.851	f	\N	f
1694	4	78	66	2025-08-25 16:30:00	1	1	1	FINISHED	f	2025-10-24 23:17:56.331	2025-10-27 20:57:37.851	f	\N	f
1695	4	67	77	2025-08-25 18:45:00	1	5	0	FINISHED	f	2025-10-24 23:17:56.332	2025-10-27 20:57:37.852	f	\N	f
1706	4	70	61	2025-09-19 18:45:00	4	1	2	FINISHED	f	2025-10-24 23:18:38.85	2025-10-24 23:18:38.85	f	\N	f
1707	4	60	65	2025-09-20 13:00:00	4	2	1	FINISHED	f	2025-10-24 23:18:38.855	2025-10-24 23:18:38.855	f	\N	f
1708	4	66	68	2025-09-20 16:00:00	4	1	1	FINISHED	f	2025-10-24 23:18:38.856	2025-10-24 23:18:38.856	f	\N	f
1709	4	78	71	2025-09-20 18:45:00	4	0	3	FINISHED	f	2025-10-24 23:18:38.857	2025-10-24 23:18:38.857	f	\N	f
1710	4	69	75	2025-09-21 10:30:00	4	0	1	FINISHED	f	2025-10-24 23:18:38.858	2025-10-24 23:18:38.858	f	\N	f
1711	4	77	59	2025-09-21 13:00:00	4	0	3	FINISHED	f	2025-10-24 23:18:38.859	2025-10-24 23:18:38.859	f	\N	f
1712	4	63	73	2025-09-21 13:00:00	4	0	0	FINISHED	f	2025-10-24 23:18:38.861	2025-10-24 23:18:38.861	f	\N	f
1713	4	64	62	2025-09-21 16:00:00	4	1	2	FINISHED	f	2025-10-24 23:18:38.862	2025-10-24 23:18:38.862	f	\N	f
1714	4	67	76	2025-09-21 18:45:00	4	2	1	FINISHED	f	2025-10-24 23:18:38.863	2025-10-24 23:18:38.863	f	\N	f
1715	4	72	74	2025-09-22 18:45:00	4	3	2	FINISHED	f	2025-10-24 23:18:38.864	2025-10-24 23:18:38.864	f	\N	f
1716	4	62	63	2025-09-27 13:00:00	5	1	1	FINISHED	f	2025-10-24 23:18:47.049	2025-10-24 23:18:47.049	f	\N	f
1717	4	68	59	2025-09-27 16:00:00	5	1	1	FINISHED	f	2025-10-24 23:18:47.053	2025-10-24 23:18:47.053	f	\N	f
1718	4	61	67	2025-09-27 18:45:00	5	0	2	FINISHED	f	2025-10-24 23:18:47.054	2025-10-24 23:18:47.054	f	\N	f
1719	4	76	78	2025-09-28 10:30:00	5	3	1	FINISHED	f	2025-10-24 23:18:47.055	2025-10-24 23:18:47.055	f	\N	f
1720	4	75	66	2025-09-28 13:00:00	5	2	0	FINISHED	f	2025-10-24 23:18:47.057	2025-10-24 23:18:47.057	f	\N	f
1721	4	74	64	2025-09-28 13:00:00	5	0	0	FINISHED	f	2025-10-24 23:18:47.058	2025-10-24 23:18:47.058	f	\N	f
1722	4	70	60	2025-09-28 16:00:00	5	2	2	FINISHED	f	2025-10-24 23:18:47.059	2025-10-24 23:18:47.059	f	\N	f
1723	4	71	72	2025-09-28 18:45:00	5	2	1	FINISHED	f	2025-10-24 23:18:47.06	2025-10-24 23:18:47.06	f	\N	f
1724	4	73	77	2025-09-29 16:30:00	5	2	1	FINISHED	f	2025-10-24 23:18:47.061	2025-10-24 23:18:47.061	f	\N	f
1725	4	65	69	2025-09-29 18:45:00	5	0	3	FINISHED	f	2025-10-24 23:18:47.062	2025-10-24 23:18:47.062	f	\N	f
1726	4	66	76	2025-10-03 18:45:00	6	0	1	FINISHED	f	2025-10-24 23:18:56.255	2025-10-24 23:18:56.255	f	\N	f
1727	4	69	77	2025-10-04 13:00:00	6	3	3	FINISHED	f	2025-10-24 23:18:56.26	2025-10-24 23:18:56.26	f	\N	f
1728	4	73	70	2025-10-04 13:00:00	6	0	1	FINISHED	f	2025-10-24 23:18:56.261	2025-10-24 23:18:56.261	f	\N	f
1729	4	67	63	2025-10-04 16:00:00	6	4	1	FINISHED	f	2025-10-24 23:18:56.262	2025-10-24 23:18:56.262	f	\N	f
1730	4	59	62	2025-10-04 18:45:00	6	1	1	FINISHED	f	2025-10-24 23:18:56.263	2025-10-24 23:18:56.263	f	\N	f
1731	4	78	61	2025-10-05 10:30:00	6	1	1	FINISHED	f	2025-10-24 23:18:56.264	2025-10-24 23:18:56.264	f	\N	f
1732	4	64	75	2025-10-05 13:00:00	6	1	2	FINISHED	f	2025-10-24 23:18:56.265	2025-10-24 23:18:56.265	f	\N	f
1733	4	60	74	2025-10-05 13:00:00	6	4	0	FINISHED	f	2025-10-24 23:18:56.266	2025-10-24 23:18:56.266	f	\N	f
1734	4	72	65	2025-10-05 16:00:00	6	2	1	FINISHED	f	2025-10-24 23:18:56.267	2025-10-24 23:18:56.267	f	\N	f
1735	4	68	71	2025-10-05 18:45:00	6	0	0	FINISHED	f	2025-10-24 23:18:56.268	2025-10-24 23:18:56.268	f	\N	f
1736	4	70	72	2025-10-28 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.316	2025-10-24 23:19:21.316	f	\N	f
1737	4	59	71	2025-10-28 19:45:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.32	2025-10-24 23:19:21.32	f	\N	f
1738	4	75	73	2025-10-29 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.322	2025-10-24 23:19:21.322	f	\N	f
1739	4	62	66	2025-10-29 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.323	2025-10-24 23:19:21.323	f	\N	f
1740	4	68	78	2025-10-29 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.324	2025-10-24 23:19:21.324	f	\N	f
1741	4	65	63	2025-10-29 19:45:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.325	2025-10-24 23:19:21.325	f	\N	f
1742	4	60	77	2025-10-29 19:45:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.326	2025-10-24 23:19:21.326	f	\N	f
1743	4	67	64	2025-10-29 19:45:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.327	2025-10-24 23:19:21.327	f	\N	f
1744	4	61	76	2025-10-30 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.328	2025-10-24 23:19:21.328	f	\N	f
1745	4	74	69	2025-10-30 19:45:00	9	\N	\N	SCHEDULED	f	2025-10-24 23:19:21.329	2025-10-24 23:19:21.329	f	\N	f
1696	4	61	73	2025-09-13 13:00:00	3	2	0	FINISHED	f	2025-10-24 23:18:29.065	2025-10-27 20:57:55.423	f	\N	f
1697	4	68	67	2025-09-13 16:00:00	3	4	3	FINISHED	f	2025-10-24 23:18:29.071	2025-10-27 20:57:55.424	f	\N	f
1698	4	64	72	2025-09-13 18:45:00	3	1	3	FINISHED	f	2025-10-24 23:18:29.073	2025-10-27 20:57:55.424	f	\N	f
1699	4	75	77	2025-09-14 10:30:00	3	0	1	FINISHED	f	2025-10-24 23:18:29.074	2025-10-27 20:57:55.425	f	\N	f
1700	4	59	70	2025-09-14 13:00:00	3	4	1	FINISHED	f	2025-10-24 23:18:29.076	2025-10-27 20:57:55.426	f	\N	f
1701	4	74	78	2025-09-14 13:00:00	3	0	1	FINISHED	f	2025-10-24 23:18:29.077	2025-10-27 20:57:55.426	f	\N	f
1702	4	76	69	2025-09-14 16:00:00	3	1	0	FINISHED	f	2025-10-24 23:18:29.079	2025-10-27 20:57:55.427	f	\N	f
1703	4	71	60	2025-09-14 18:45:00	3	1	0	FINISHED	f	2025-10-24 23:18:29.08	2025-10-27 20:57:55.427	f	\N	f
1704	4	66	63	2025-09-15 16:30:00	3	0	0	FINISHED	f	2025-10-24 23:18:29.081	2025-10-27 20:57:55.428	f	\N	f
1705	4	62	65	2025-09-15 18:45:00	3	1	1	FINISHED	f	2025-10-24 23:18:29.083	2025-10-27 20:57:55.429	f	\N	f
1746	5	28	5	2025-09-16 16:45:00	1	0	2	FINISHED	f	2025-10-25 12:14:25.375	2025-10-25 12:14:25.375	f	\N	f
1747	5	86	92	2025-09-16 16:45:00	1	1	3	FINISHED	f	2025-10-25 12:14:25.379	2025-10-25 12:14:25.379	f	\N	f
1748	5	68	51	2025-09-16 19:00:00	1	4	4	FINISHED	f	2025-10-25 12:14:25.38	2025-10-25 12:14:25.38	f	\N	f
1749	5	91	84	2025-09-16 19:00:00	1	2	3	FINISHED	f	2025-10-25 12:14:25.381	2025-10-25 12:14:25.381	f	\N	f
1750	5	4	39	2025-09-16 19:00:00	1	1	0	FINISHED	f	2025-10-25 12:14:25.382	2025-10-25 12:14:25.382	f	\N	f
1751	5	29	80	2025-09-16 19:00:00	1	2	1	FINISHED	f	2025-10-25 12:14:25.384	2025-10-25 12:14:25.384	f	\N	f
1752	5	89	93	2025-09-17 16:45:00	1	2	2	FINISHED	f	2025-10-25 12:14:25.385	2025-10-25 12:14:25.385	f	\N	f
1753	5	85	95	2025-09-17 16:45:00	1	0	0	FINISHED	f	2025-10-25 12:14:25.386	2025-10-25 12:14:25.386	f	\N	f
1754	5	87	67	2025-09-17 19:00:00	1	0	2	FINISHED	f	2025-10-25 12:14:25.388	2025-10-25 12:14:25.388	f	\N	f
1755	5	15	26	2025-09-17 19:00:00	1	3	2	FINISHED	f	2025-10-25 12:14:25.389	2025-10-25 12:14:25.389	f	\N	f
1756	5	81	59	2025-09-17 19:00:00	1	4	0	FINISHED	f	2025-10-25 12:14:25.39	2025-10-25 12:14:25.39	f	\N	f
1757	5	41	10	2025-09-17 19:00:00	1	3	1	FINISHED	f	2025-10-25 12:14:25.391	2025-10-25 12:14:25.391	f	\N	f
1758	5	90	43	2025-09-18 16:45:00	1	2	2	FINISHED	f	2025-10-25 12:14:25.392	2025-10-25 12:14:25.392	f	\N	f
1759	5	88	82	2025-09-18 16:45:00	1	4	1	FINISHED	f	2025-10-25 12:14:25.393	2025-10-25 12:14:25.393	f	\N	f
1760	5	16	37	2025-09-18 19:00:00	1	1	2	FINISHED	f	2025-10-25 12:14:25.394	2025-10-25 12:14:25.394	f	\N	f
1761	5	19	72	2025-09-18 19:00:00	1	2	0	FINISHED	f	2025-10-25 12:14:25.395	2025-10-25 12:14:25.395	f	\N	f
1762	5	44	83	2025-09-18 19:00:00	1	5	1	FINISHED	f	2025-10-25 12:14:25.396	2025-10-25 12:14:25.396	f	\N	f
1763	5	79	94	2025-09-18 19:00:00	1	4	1	FINISHED	f	2025-10-25 12:14:25.397	2025-10-25 12:14:25.397	f	\N	f
1764	5	59	88	2025-09-30 16:45:00	2	2	1	FINISHED	f	2025-10-25 12:14:41.187	2025-10-25 12:14:41.187	f	\N	f
1765	5	94	29	2025-09-30 16:45:00	2	0	5	FINISHED	f	2025-10-25 12:14:41.188	2025-10-25 12:14:41.188	f	\N	f
1766	5	83	15	2025-09-30 19:00:00	2	1	0	FINISHED	f	2025-10-25 12:14:41.189	2025-10-25 12:14:41.189	f	\N	f
1767	5	26	44	2025-09-30 19:00:00	2	5	1	FINISHED	f	2025-10-25 12:14:41.19	2025-10-25 12:14:41.19	f	\N	f
1768	5	80	87	2025-09-30 19:00:00	2	4	0	FINISHED	f	2025-10-25 12:14:41.191	2025-10-25 12:14:41.191	f	\N	f
1769	5	93	4	2025-09-30 19:00:00	2	2	2	FINISHED	f	2025-10-25 12:14:41.192	2025-10-25 12:14:41.192	f	\N	f
1770	5	95	41	2025-09-30 19:00:00	2	1	5	FINISHED	f	2025-10-25 12:14:41.193	2025-10-25 12:14:41.193	f	\N	f
1771	5	10	91	2025-09-30 19:00:00	2	1	0	FINISHED	f	2025-10-25 12:14:41.194	2025-10-25 12:14:41.194	f	\N	f
1772	5	67	89	2025-09-30 19:00:00	2	3	0	FINISHED	f	2025-10-25 12:14:41.195	2025-10-25 12:14:41.195	f	\N	f
1773	5	84	90	2025-10-01 16:45:00	2	2	0	FINISHED	f	2025-10-25 12:14:41.196	2025-10-25 12:14:41.196	f	\N	f
1774	5	92	16	2025-10-01 16:45:00	2	0	4	FINISHED	f	2025-10-25 12:14:41.198	2025-10-25 12:14:41.198	f	\N	f
1775	5	51	28	2025-10-01 19:00:00	2	4	1	FINISHED	f	2025-10-25 12:14:41.199	2025-10-25 12:14:41.199	f	\N	f
1776	5	37	81	2025-10-01 19:00:00	2	1	2	FINISHED	f	2025-10-25 12:14:41.2	2025-10-25 12:14:41.2	f	\N	f
1777	5	82	19	2025-10-01 19:00:00	2	2	2	FINISHED	f	2025-10-25 12:14:41.201	2025-10-25 12:14:41.201	f	\N	f
1778	5	43	86	2025-10-01 19:00:00	2	1	1	FINISHED	f	2025-10-25 12:14:41.202	2025-10-25 12:14:41.202	f	\N	f
1779	5	5	85	2025-10-01 19:00:00	2	2	0	FINISHED	f	2025-10-25 12:14:41.203	2025-10-25 12:14:41.203	f	\N	f
1780	5	39	68	2025-10-01 19:00:00	2	2	2	FINISHED	f	2025-10-25 12:14:41.204	2025-10-25 12:14:41.204	f	\N	f
1781	5	72	79	2025-10-01 19:00:00	2	2	1	FINISHED	f	2025-10-25 12:14:41.205	2025-10-25 12:14:41.205	f	\N	f
1782	5	37	85	2025-10-21 16:45:00	3	6	1	FINISHED	f	2025-10-25 12:14:49.99	2025-10-25 12:14:49.99	f	\N	f
1783	5	94	95	2025-10-21 16:45:00	3	0	0	FINISHED	f	2025-10-25 12:14:49.992	2025-10-25 12:14:49.992	f	\N	f
1784	5	92	67	2025-10-21 19:00:00	3	0	4	FINISHED	f	2025-10-25 12:14:49.993	2025-10-25 12:14:49.993	f	\N	f
1785	5	90	51	2025-10-21 19:00:00	3	2	4	FINISHED	f	2025-10-25 12:14:49.994	2025-10-25 12:14:49.994	f	\N	f
1786	5	43	81	2025-10-21 19:00:00	3	2	7	FINISHED	f	2025-10-25 12:14:49.995	2025-10-25 12:14:49.995	f	\N	f
1787	5	39	19	2025-10-21 19:00:00	3	0	2	FINISHED	f	2025-10-25 12:14:49.996	2025-10-25 12:14:49.996	f	\N	f
1788	5	5	26	2025-10-21 19:00:00	3	4	0	FINISHED	f	2025-10-25 12:14:49.997	2025-10-25 12:14:49.997	f	\N	f
1789	5	16	91	2025-10-21 19:00:00	3	3	0	FINISHED	f	2025-10-25 12:14:49.998	2025-10-25 12:14:49.998	f	\N	f
1790	5	86	72	2025-10-21 19:00:00	3	6	2	FINISHED	f	2025-10-25 12:14:49.999	2025-10-25 12:14:49.999	f	\N	f
1791	5	83	93	2025-10-22 16:45:00	3	3	1	FINISHED	f	2025-10-25 12:14:50	2025-10-25 12:14:50	f	\N	f
1792	5	28	84	2025-10-22 16:45:00	3	3	1	FINISHED	f	2025-10-25 12:14:50.001	2025-10-25 12:14:50.001	f	\N	f
1793	5	44	15	2025-10-22 19:00:00	3	1	5	FINISHED	f	2025-10-25 12:14:50.003	2025-10-25 12:14:50.003	f	\N	f
1794	5	59	89	2025-10-22 19:00:00	3	0	0	FINISHED	f	2025-10-25 12:14:50.004	2025-10-25 12:14:50.004	f	\N	f
1795	5	79	80	2025-10-22 19:00:00	3	2	1	FINISHED	f	2025-10-25 12:14:50.005	2025-10-25 12:14:50.005	f	\N	f
1796	5	82	4	2025-10-22 19:00:00	3	0	0	FINISHED	f	2025-10-25 12:14:50.006	2025-10-25 12:14:50.006	f	\N	f
1797	5	41	88	2025-10-22 19:00:00	3	4	0	FINISHED	f	2025-10-25 12:14:50.007	2025-10-25 12:14:50.007	f	\N	f
1798	5	10	87	2025-10-22 19:00:00	3	5	1	FINISHED	f	2025-10-25 12:14:50.008	2025-10-25 12:14:50.008	f	\N	f
1799	5	29	68	2025-10-22 19:00:00	3	1	0	FINISHED	f	2025-10-25 12:14:50.009	2025-10-25 12:14:50.009	f	\N	f
1800	5	89	5	2025-11-04 17:45:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.471	2025-10-25 12:15:11.471	f	\N	f
1801	5	72	44	2025-11-04 17:45:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.477	2025-10-25 12:15:11.477	f	\N	f
1802	5	68	79	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.479	2025-10-25 12:15:11.479	f	\N	f
1803	5	26	92	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.48	2025-10-25 12:15:11.48	f	\N	f
1804	5	4	90	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.481	2025-10-25 12:15:11.481	f	\N	f
1805	5	93	82	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.482	2025-10-25 12:15:11.482	f	\N	f
1806	5	85	86	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.484	2025-10-25 12:15:11.484	f	\N	f
1807	5	81	41	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.485	2025-10-25 12:15:11.485	f	\N	f
1808	5	15	29	2025-11-04 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.486	2025-10-25 12:15:11.486	f	\N	f
1809	5	95	39	2025-11-05 17:45:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.487	2025-10-25 12:15:11.487	f	\N	f
1810	5	84	10	2025-11-05 17:45:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.488	2025-10-25 12:15:11.488	f	\N	f
1811	5	67	94	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.489	2025-10-25 12:15:11.489	f	\N	f
1812	5	19	51	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.491	2025-10-25 12:15:11.491	f	\N	f
1813	5	88	37	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.492	2025-10-25 12:15:11.492	f	\N	f
1814	5	91	43	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.493	2025-10-25 12:15:11.493	f	\N	f
1815	5	80	59	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.495	2025-10-25 12:15:11.495	f	\N	f
1816	5	87	83	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.496	2025-10-25 12:15:11.496	f	\N	f
1817	5	16	28	2025-11-05 20:00:00	4	\N	\N	SCHEDULED	f	2025-10-25 12:15:11.497	2025-10-25 12:15:11.497	f	\N	f
1818	5	87	91	2025-11-25 17:45:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.151	2025-10-25 12:15:19.151	f	\N	f
1819	5	83	92	2025-11-25 17:45:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.152	2025-10-25 12:15:19.152	f	\N	f
1820	5	51	39	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.153	2025-10-25 12:15:19.153	f	\N	f
1821	5	19	43	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.154	2025-10-25 12:15:19.154	f	\N	f
1822	5	93	68	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.155	2025-10-25 12:15:19.155	f	\N	f
1823	5	80	16	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.156	2025-10-25 12:15:19.156	f	\N	f
1824	5	89	28	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.157	2025-10-25 12:15:19.157	f	\N	f
1825	5	72	84	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.158	2025-10-25 12:15:19.158	f	\N	f
1826	5	10	37	2025-11-25 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.16	2025-10-25 12:15:19.16	f	\N	f
1827	5	95	82	2025-11-26 17:45:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.161	2025-10-25 12:15:19.161	f	\N	f
1828	5	90	94	2025-11-26 17:45:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.162	2025-10-25 12:15:19.162	f	\N	f
1829	5	15	86	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.163	2025-10-25 12:15:19.163	f	\N	f
1830	5	81	4	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.164	2025-10-25 12:15:19.164	f	\N	f
1831	5	44	59	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.165	2025-10-25 12:15:19.165	f	\N	f
1832	5	79	88	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.167	2025-10-25 12:15:19.167	f	\N	f
1833	5	5	41	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.168	2025-10-25 12:15:19.168	f	\N	f
1834	5	85	29	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.169	2025-10-25 12:15:19.169	f	\N	f
1835	5	26	67	2025-11-26 20:00:00	5	\N	\N	SCHEDULED	f	2025-10-25 12:15:19.169	2025-10-25 12:15:19.169	f	\N	f
1836	5	94	85	2025-12-09 15:30:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.962	2025-10-25 12:15:24.962	f	\N	f
1837	5	41	79	2025-12-09 17:45:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.964	2025-10-25 12:15:24.964	f	\N	f
1838	5	37	44	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.965	2025-10-25 12:15:24.965	f	\N	f
1839	5	86	26	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.966	2025-10-25 12:15:24.966	f	\N	f
1840	5	92	80	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.967	2025-10-25 12:15:24.967	f	\N	f
1841	5	4	89	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.969	2025-10-25 12:15:24.969	f	\N	f
1842	5	82	83	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.97	2025-10-25 12:15:24.97	f	\N	f
1843	5	59	10	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.972	2025-10-25 12:15:24.972	f	\N	f
1844	5	67	15	2025-12-09 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.973	2025-10-25 12:15:24.973	f	\N	f
1845	5	39	90	2025-12-10 17:45:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.974	2025-10-25 12:15:24.974	f	\N	f
1846	5	84	87	2025-12-10 17:45:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.975	2025-10-25 12:15:24.975	f	\N	f
1847	5	51	93	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.976	2025-10-25 12:15:24.976	f	\N	f
1848	5	28	81	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.976	2025-10-25 12:15:24.976	f	\N	f
1849	5	43	16	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.977	2025-10-25 12:15:24.977	f	\N	f
1850	5	88	5	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.978	2025-10-25 12:15:24.978	f	\N	f
1851	5	91	72	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.979	2025-10-25 12:15:24.979	f	\N	f
1852	5	68	95	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.98	2025-10-25 12:15:24.98	f	\N	f
1853	5	29	19	2025-12-10 20:00:00	6	\N	\N	SCHEDULED	f	2025-10-25 12:15:24.982	2025-10-25 12:15:24.982	f	\N	f
1854	5	94	88	2026-01-20 15:30:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.272	2025-10-25 12:15:30.272	f	\N	f
1855	5	93	19	2026-01-20 17:45:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.274	2025-10-25 12:15:30.274	f	\N	f
1856	5	4	51	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.275	2025-10-25 12:15:30.275	f	\N	f
1857	5	79	81	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.276	2025-10-25 12:15:30.276	f	\N	f
1858	5	85	43	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.277	2025-10-25 12:15:30.277	f	\N	f
1859	5	39	87	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.278	2025-10-25 12:15:30.278	f	\N	f
1860	5	90	72	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.279	2025-10-25 12:15:30.279	f	\N	f
1861	5	29	82	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.281	2025-10-25 12:15:30.281	f	\N	f
1862	5	67	5	2026-01-20 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.282	2025-10-25 12:15:30.282	f	\N	f
1863	5	84	44	2026-01-21 17:45:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.283	2025-10-25 12:15:30.283	f	\N	f
1864	5	83	26	2026-01-21 17:45:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.283	2025-10-25 12:15:30.283	f	\N	f
1865	5	80	15	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.285	2025-10-25 12:15:30.285	f	\N	f
1866	5	89	37	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.286	2025-10-25 12:15:30.286	f	\N	f
1867	5	59	28	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.287	2025-10-25 12:15:30.287	f	\N	f
1868	5	68	91	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.288	2025-10-25 12:15:30.288	f	\N	f
1869	5	16	86	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.29	2025-10-25 12:15:30.29	f	\N	f
1870	5	41	92	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.291	2025-10-25 12:15:30.291	f	\N	f
1871	5	10	95	2026-01-21 20:00:00	7	\N	\N	SCHEDULED	f	2025-10-25 12:15:30.293	2025-10-25 12:15:30.293	f	\N	f
1872	5	15	84	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.855	2025-10-25 12:15:34.855	f	\N	f
1873	5	37	90	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.857	2025-10-25 12:15:34.857	f	\N	f
1874	5	19	83	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.858	2025-10-25 12:15:34.858	f	\N	f
1875	5	43	39	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.859	2025-10-25 12:15:34.859	f	\N	f
1876	5	5	94	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.861	2025-10-25 12:15:34.861	f	\N	f
339	2	25	29	2025-10-19 19:00:00	9	0	1	FINISHED	t	2025-10-11 16:34:36.294	2025-10-19 22:38:24.857	f	\N	f
1597	1	6	4	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.13	2025-10-24 21:57:29.13	f	\N	f
1598	1	17	20	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.137	2025-10-24 21:57:29.137	f	\N	f
1599	1	5	15	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.14	2025-10-24 21:57:29.14	f	\N	f
1600	1	12	3	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.142	2025-10-24 21:57:29.142	f	\N	f
1601	1	7	11	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.144	2025-10-24 21:57:29.144	f	\N	f
1602	1	8	18	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.145	2025-10-24 21:57:29.145	f	\N	f
1603	1	9	10	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.147	2025-10-24 21:57:29.147	f	\N	f
1604	1	19	1	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.148	2025-10-24 21:57:29.148	f	\N	f
1605	1	16	13	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.149	2025-10-24 21:57:29.149	f	\N	f
1606	1	2	14	2026-01-07 00:00:00	21	\N	\N	SCHEDULED	f	2025-10-24 21:57:29.15	2025-10-24 21:57:29.15	f	\N	f
1877	5	92	59	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.862	2025-10-25 12:15:34.862	f	\N	f
1878	5	88	80	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.864	2025-10-25 12:15:34.864	f	\N	f
1879	5	44	4	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.865	2025-10-25 12:15:34.865	f	\N	f
1880	5	82	68	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.866	2025-10-25 12:15:34.866	f	\N	f
1881	5	26	93	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.867	2025-10-25 12:15:34.867	f	\N	f
1882	5	28	79	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.868	2025-10-25 12:15:34.868	f	\N	f
1883	5	87	85	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.869	2025-10-25 12:15:34.869	f	\N	f
1884	5	81	16	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.871	2025-10-25 12:15:34.871	f	\N	f
1885	5	95	89	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.872	2025-10-25 12:15:34.872	f	\N	f
1886	5	86	41	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.873	2025-10-25 12:15:34.873	f	\N	f
1887	5	72	10	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.874	2025-10-25 12:15:34.874	f	\N	f
1888	5	91	29	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.875	2025-10-25 12:15:34.875	f	\N	f
1889	5	51	67	2026-01-28 20:00:00	8	\N	\N	SCHEDULED	f	2025-10-25 12:15:34.876	2025-10-25 12:15:34.876	f	\N	f
275	1	2	12	2025-10-20 19:00:00	8	0	2	FINISHED	t	2025-10-11 14:24:19.111	2025-10-24 21:59:43.155	f	\N	f
1890	3	42	51	2025-10-31 19:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.235	2025-10-27 20:55:52.235	f	\N	f
1891	3	54	56	2025-11-01 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.239	2025-10-27 20:55:52.239	f	\N	f
1892	3	52	55	2025-11-01 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.24	2025-10-27 20:55:52.24	f	\N	f
1893	3	53	50	2025-11-01 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.241	2025-10-27 20:55:52.241	f	\N	f
1894	3	49	46	2025-11-01 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.243	2025-10-27 20:55:52.243	f	\N	f
1895	3	47	44	2025-11-01 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.244	2025-10-27 20:55:52.244	f	\N	f
1896	3	41	43	2025-11-01 17:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.245	2025-10-27 20:55:52.245	f	\N	f
1897	3	57	45	2025-11-02 14:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.246	2025-10-27 20:55:52.246	f	\N	f
1898	3	58	48	2025-11-02 16:30:00	9	\N	\N	SCHEDULED	f	2025-10-27 20:55:52.247	2025-10-27 20:55:52.247	f	\N	f
1899	4	78	59	2025-11-01 14:00:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.21	2025-10-27 20:56:14.21	f	\N	f
1900	4	72	62	2025-11-01 17:00:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.211	2025-10-27 20:56:14.211	f	\N	f
1901	4	63	68	2025-11-01 19:45:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.212	2025-10-27 20:56:14.212	f	\N	f
1902	4	66	67	2025-11-02 11:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.213	2025-10-27 20:56:14.213	f	\N	f
1903	4	64	70	2025-11-02 14:00:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.214	2025-10-27 20:56:14.214	f	\N	f
1904	4	77	74	2025-11-02 14:00:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.216	2025-10-27 20:56:14.216	f	\N	f
1905	4	73	60	2025-11-02 17:00:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.217	2025-10-27 20:56:14.217	f	\N	f
1906	4	71	75	2025-11-02 19:45:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.218	2025-10-27 20:56:14.218	f	\N	f
1907	4	76	65	2025-11-03 17:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.219	2025-10-27 20:56:14.219	f	\N	f
1908	4	69	61	2025-11-03 19:45:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:14.221	2025-10-27 20:56:14.221	f	\N	f
1909	3	56	58	2025-11-07 19:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.58	2025-10-27 20:56:28.58	f	\N	f
1910	3	43	47	2025-11-08 14:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.582	2025-10-27 20:56:28.582	f	\N	f
1911	3	53	41	2025-11-08 14:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.583	2025-10-27 20:56:28.583	f	\N	f
1912	3	48	52	2025-11-08 14:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.585	2025-10-27 20:56:28.585	f	\N	f
1913	3	45	51	2025-11-08 14:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.586	2025-10-27 20:56:28.586	f	\N	f
1914	3	46	57	2025-11-08 17:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.587	2025-10-27 20:56:28.587	f	\N	f
1915	3	50	49	2025-11-09 14:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.588	2025-10-27 20:56:28.588	f	\N	f
1916	3	55	42	2025-11-09 16:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.589	2025-10-27 20:56:28.589	f	\N	f
1917	3	44	54	2025-11-09 18:30:00	10	\N	\N	SCHEDULED	f	2025-10-27 20:56:28.59	2025-10-27 20:56:28.59	f	\N	f
1918	2	32	38	2025-11-07 20:00:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.857	2025-10-27 20:56:43.857	f	\N	f
1919	2	23	31	2025-11-08 13:00:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.859	2025-10-27 20:56:43.859	f	\N	f
1920	2	35	27	2025-11-08 15:15:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.86	2025-10-27 20:56:43.86	f	\N	f
1921	2	26	21	2025-11-08 17:30:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.861	2025-10-27 20:56:43.861	f	\N	f
1922	2	36	39	2025-11-08 20:00:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.862	2025-10-27 20:56:43.862	f	\N	f
1923	2	28	22	2025-11-09 13:00:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.863	2025-10-27 20:56:43.863	f	\N	f
1924	2	34	29	2025-11-09 15:15:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.864	2025-10-27 20:56:43.864	f	\N	f
1925	2	40	24	2025-11-09 17:30:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.865	2025-10-27 20:56:43.865	f	\N	f
1926	2	30	25	2025-11-09 17:30:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.866	2025-10-27 20:56:43.866	f	\N	f
1927	2	33	37	2025-11-09 20:00:00	12	\N	\N	SCHEDULED	f	2025-10-27 20:56:43.867	2025-10-27 20:56:43.867	f	\N	f
1928	1	4	11	2025-11-08 12:30:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.563	2025-10-27 20:56:53.563	f	\N	f
1929	1	8	9	2025-11-08 15:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.564	2025-10-27 20:56:53.564	f	\N	f
1930	1	2	7	2025-11-08 15:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.566	2025-10-27 20:56:53.566	f	\N	f
1931	1	3	5	2025-11-08 17:30:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.567	2025-10-27 20:56:53.567	f	\N	f
1932	1	10	18	2025-11-08 20:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.568	2025-10-27 20:56:53.568	f	\N	f
1933	1	20	6	2025-11-09 14:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.57	2025-10-27 20:56:53.57	f	\N	f
1934	1	17	1	2025-11-09 14:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.571	2025-10-27 20:56:53.571	f	\N	f
1935	1	12	16	2025-11-09 14:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.572	2025-10-27 20:56:53.572	f	\N	f
1936	1	14	13	2025-11-09 14:00:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.573	2025-10-27 20:56:53.573	f	\N	f
1937	1	19	15	2025-11-09 16:30:00	11	\N	\N	SCHEDULED	f	2025-10-27 20:56:53.574	2025-10-27 20:56:53.574	f	\N	f
1607	1	1	13	2025-11-01 15:00:00	10	3	0	FINISHED	f	2025-10-24 22:01:47.506	2025-11-03 12:50:46.801	f	\N	f
1608	1	17	12	2025-11-01 15:00:00	10	2	0	FINISHED	f	2025-10-24 22:01:47.51	2025-11-03 12:50:46.802	f	\N	f
1609	1	7	5	2025-11-01 15:00:00	10	0	2	FINISHED	f	2025-10-24 22:01:47.511	2025-11-03 12:50:46.803	f	\N	f
1610	1	9	18	2025-11-01 15:00:00	10	3	0	FINISHED	f	2025-10-24 22:01:47.513	2025-11-03 12:50:46.804	f	\N	f
1611	1	14	11	2025-11-01 15:00:00	10	2	2	FINISHED	f	2025-10-24 22:01:47.515	2025-11-03 12:50:46.805	f	\N	f
1612	1	4	10	2025-11-01 17:30:00	10	0	1	FINISHED	f	2025-10-24 22:01:47.516	2025-11-03 12:50:46.806	f	\N	f
1613	1	15	20	2025-11-01 20:00:00	10	2	0	FINISHED	f	2025-10-24 22:01:47.517	2025-11-03 12:50:46.807	f	\N	f
1614	1	2	16	2025-11-02 14:00:00	10	3	1	FINISHED	f	2025-10-24 22:01:47.518	2025-11-03 12:50:46.807	f	\N	f
1615	1	19	6	2025-11-02 16:30:00	10	3	1	FINISHED	f	2025-10-24 22:01:47.519	2025-11-03 12:50:46.809	f	\N	f
1616	1	3	8	2025-11-03 20:00:00	10	\N	\N	SCHEDULED	f	2025-10-24 22:01:47.521	2025-11-03 12:50:46.81	f	\N	f
359	2	38	35	2025-10-24 19:00:00	10	2	1	FINISHED	t	2025-10-18 11:20:44.894	2025-10-27 21:01:54.92	f	\N	f
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, data, "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PointsRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PointsRule" (id, name, description, points, type, condition, priority, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Exact Home Score	Predicting the exact home team score	1	EXACT_HOME_SCORE	\N	1	t	2025-10-12 15:22:45.423	2025-10-12 15:35:23.166
2	Exact Away Score	Predicting the exact away team score	1	EXACT_AWAY_SCORE	\N	2	t	2025-10-12 15:22:45.428	2025-10-12 15:35:23.166
4	Correct Total Goals	Predicting the correct total number of goals for both teams	2	CORRECT_TOTAL_GOALS	\N	4	t	2025-10-12 15:22:45.43	2025-10-25 14:21:20.197
5	Exact Score Bonus	Bonus points for predicting the exact final score	2	EXACT_SCORE_BONUS	\N	5	t	2025-10-12 15:22:45.431	2025-10-25 14:21:20.197
6	Correct Result	Predicting the correct match outcome (win/draw/loss)	3	CORRECT_RESULT	\N	6	t	2025-10-12 15:22:45.429	2025-10-25 14:22:09.233
3	Correct Goal Difference	Predicting the correct goal difference between home and away teams (e.g., 4-3 and 2-1 both have +1 difference)	1	CORRECT_GOAL_DIFFERENCE	\N	3	t	2025-10-25 14:17:20.629	2025-10-25 14:22:13.725
\.


--
-- Data for Name: Prediction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Prediction" (id, "userId", "matchId", "predictedHomeScore", "predictedAwayScore", "predictedResult", confidence, "resultPoints", "scorePoints", "bonusPoints", "totalPoints", "isProcessed", "isLate", "createdAt", "updatedAt", status) FROM stdin;
170	2	1800	0	4	\N	50	0	0	0	0	f	f	2025-10-25 14:49:21.167	2025-10-25 14:49:21.167	NOT_PLAYED_YET
134	3	364	2	0	\N	50	0	0	0	2	t	f	2025-10-24 22:20:09.708	2025-11-03 12:51:16.219	COMPLETED
138	3	365	3	2	\N	50	0	0	0	4	t	f	2025-10-24 22:21:51.837	2025-11-03 12:51:16.22	COMPLETED
72	3	285	0	2	\N	50	0	0	0	0	t	f	2025-10-12 19:50:04.169	2025-11-03 12:51:16.221	COMPLETED
111	2	285	1	0	\N	50	0	0	0	3	t	f	2025-10-12 20:18:01.273	2025-11-03 12:51:16.222	COMPLETED
91	3	266	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:02:24.893	2025-11-03 12:51:16.225	COMPLETED
135	3	366	0	0	\N	50	0	0	0	0	t	f	2025-10-24 22:20:23.006	2025-11-03 12:51:16.223	COMPLETED
136	3	367	3	1	\N	50	0	0	0	3	t	f	2025-10-24 22:20:36.086	2025-11-03 12:51:16.224	COMPLETED
120	2	266	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:19:46.389	2025-11-03 12:51:16.226	COMPLETED
94	3	269	3	1	\N	50	0	0	0	1	t	f	2025-10-12 20:02:56.681	2025-11-03 12:51:16.227	COMPLETED
122	2	268	2	1	\N	50	0	0	0	4	t	f	2025-10-12 20:20:08.563	2025-11-03 12:51:16.228	COMPLETED
95	3	270	3	1	\N	50	0	0	0	4	t	f	2025-10-12 20:03:41.57	2025-11-03 12:51:16.229	COMPLETED
124	2	270	3	0	\N	50	0	0	0	4	t	f	2025-10-12 20:20:35.414	2025-11-03 12:51:16.23	COMPLETED
92	3	267	1	1	\N	50	0	0	0	1	t	f	2025-10-12 20:02:42.279	2025-11-03 12:51:16.23	COMPLETED
121	2	267	2	3	\N	50	0	0	0	1	t	f	2025-10-12 20:19:56.234	2025-11-03 12:51:16.231	COMPLETED
73	3	286	2	0	\N	50	0	0	0	2	t	f	2025-10-12 19:58:49.791	2025-11-03 12:51:16.231	COMPLETED
74	3	287	0	2	\N	50	0	0	0	1	t	f	2025-10-12 19:59:20.936	2025-11-03 12:51:16.233	COMPLETED
113	2	287	1	2	\N	50	0	0	0	1	t	f	2025-10-12 20:18:25.009	2025-11-03 12:51:16.234	COMPLETED
81	3	331	0	1	\N	50	0	0	0	4	t	f	2025-10-12 20:00:34.029	2025-11-03 12:51:16.234	COMPLETED
101	2	331	1	2	\N	50	0	0	0	4	t	f	2025-10-12 20:15:43.512	2025-11-03 12:51:16.235	COMPLETED
99	3	274	2	2	\N	50	0	0	0	1	t	f	2025-10-12 20:04:20.571	2025-11-03 12:51:16.235	COMPLETED
128	2	274	2	1	\N	50	0	0	0	2	t	f	2025-10-12 20:21:11.712	2025-11-03 12:51:16.236	COMPLETED
98	3	273	2	2	\N	50	0	0	0	1	t	f	2025-10-12 20:04:04.632	2025-11-03 12:51:16.237	COMPLETED
127	2	273	2	0	\N	50	0	0	0	0	t	f	2025-10-12 20:20:58.665	2025-11-03 12:51:16.237	COMPLETED
97	3	272	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:03:55.898	2025-11-03 12:51:16.238	COMPLETED
126	2	272	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:20:52.087	2025-11-03 12:51:16.238	COMPLETED
125	2	271	2	0	\N	50	0	0	0	10	t	f	2025-10-12 20:20:44.909	2025-11-03 12:51:16.239	COMPLETED
96	3	271	2	0	\N	50	0	0	0	10	t	f	2025-10-12 20:03:47.052	2025-11-03 12:51:16.24	COMPLETED
102	2	332	3	0	\N	50	0	0	0	0	t	f	2025-10-12 20:15:55.424	2025-11-03 12:51:16.24	COMPLETED
82	3	332	2	1	\N	50	0	0	0	0	t	f	2025-10-12 20:00:42.448	2025-11-03 12:51:16.241	COMPLETED
83	3	333	3	1	\N	50	0	0	0	4	t	f	2025-10-12 20:00:49.715	2025-11-03 12:51:16.241	COMPLETED
103	2	333	3	1	\N	50	0	0	0	4	t	f	2025-10-12 20:16:06.705	2025-11-03 12:51:16.242	COMPLETED
137	3	368	2	2	\N	50	0	0	0	1	t	f	2025-10-24 22:20:49.751	2025-11-03 12:51:16.245	COMPLETED
104	2	334	2	1	\N	50	0	0	0	1	t	f	2025-10-12 20:16:18.292	2025-11-03 12:51:16.246	COMPLETED
84	3	334	1	1	\N	50	0	0	0	4	t	f	2025-10-12 20:00:58.61	2025-11-03 12:51:16.247	COMPLETED
123	2	269	1	2	\N	50	0	0	0	0	t	f	2025-10-12 20:20:13.707	2025-11-03 12:51:16.226	COMPLETED
105	2	335	2	0	\N	50	0	0	0	4	t	f	2025-10-12 20:16:25.034	2025-11-03 12:51:16.247	COMPLETED
85	3	335	2	1	\N	50	0	0	0	4	t	f	2025-10-12 20:01:17.789	2025-11-03 12:51:16.248	COMPLETED
140	3	371	2	1	\N	50	0	0	0	2	t	f	2025-10-24 22:22:34.13	2025-11-03 12:51:16.25	COMPLETED
86	3	336	0	3	\N	50	0	0	0	1	t	f	2025-10-12 20:01:24.367	2025-11-03 12:51:16.252	COMPLETED
106	2	336	1	1	\N	50	0	0	0	4	t	f	2025-10-12 20:16:35.759	2025-11-03 12:51:16.252	COMPLETED
107	2	337	2	2	\N	50	0	0	0	4	t	f	2025-10-12 20:16:45.856	2025-11-03 12:51:16.253	COMPLETED
108	2	338	1	0	\N	50	0	0	0	0	t	f	2025-10-12 20:16:58.185	2025-11-03 12:51:16.254	COMPLETED
114	2	288	1	3	\N	50	0	0	0	3	t	f	2025-10-12 20:18:36.003	2025-11-03 12:51:16.255	COMPLETED
76	3	289	3	2	\N	50	0	0	0	4	t	f	2025-10-12 19:59:42.288	2025-11-03 12:51:16.256	COMPLETED
115	2	289	2	0	\N	50	0	0	0	4	t	f	2025-10-12 20:18:42.956	2025-11-03 12:51:16.257	COMPLETED
77	3	290	2	2	\N	50	0	0	0	0	t	f	2025-10-12 19:59:48.266	2025-11-03 12:51:16.257	COMPLETED
116	2	290	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:18:53.065	2025-11-03 12:51:16.258	COMPLETED
78	3	291	3	1	\N	50	0	0	0	4	t	f	2025-10-12 19:59:55.1	2025-11-03 12:51:16.259	COMPLETED
117	2	291	3	1	\N	50	0	0	0	4	t	f	2025-10-12 20:18:57.789	2025-11-03 12:51:16.259	COMPLETED
141	3	372	2	3	\N	50	0	0	0	0	t	f	2025-10-24 22:22:49.327	2025-11-03 12:51:16.26	COMPLETED
118	2	292	2	1	\N	50	0	0	0	1	t	f	2025-10-12 20:19:08.405	2025-11-03 12:51:16.261	COMPLETED
79	3	292	2	3	\N	50	0	0	0	1	t	f	2025-10-12 20:00:02.194	2025-11-03 12:51:16.262	COMPLETED
119	2	293	2	0	\N	50	0	0	0	0	t	f	2025-10-12 20:19:17.988	2025-11-03 12:51:16.262	COMPLETED
80	3	293	0	2	\N	50	0	0	0	4	t	f	2025-10-12 20:00:10.399	2025-11-03 12:51:16.263	COMPLETED
110	2	340	2	1	\N	50	0	0	0	0	t	f	2025-10-12 20:17:28.524	2025-11-03 12:51:16.264	COMPLETED
89	3	339	1	4	\N	50	0	0	0	3	t	f	2025-10-12 20:01:54.369	2025-11-03 12:51:16.272	COMPLETED
109	2	339	1	3	\N	50	0	0	0	3	t	f	2025-10-12 20:17:06.696	2025-11-03 12:51:16.273	COMPLETED
100	3	275	2	3	\N	50	0	0	0	3	t	f	2025-10-12 20:04:28.978	2025-11-03 12:51:16.274	COMPLETED
129	2	275	1	1	\N	50	0	0	0	2	t	f	2025-10-12 20:21:16.852	2025-11-03 12:51:16.274	COMPLETED
132	3	362	2	1	\N	50	0	0	0	1	t	f	2025-10-24 22:19:34.172	2025-11-03 12:51:16.217	COMPLETED
133	3	363	1	4	\N	50	0	0	0	3	t	f	2025-10-24 22:19:49.968	2025-11-03 12:51:16.218	COMPLETED
93	3	268	2	1	\N	50	0	0	0	4	t	f	2025-10-12 20:02:49.367	2025-11-03 12:51:16.228	COMPLETED
139	3	370	2	0	\N	50	0	0	0	4	t	f	2025-10-24 22:22:25.536	2025-11-03 12:51:16.249	COMPLETED
87	3	337	2	1	\N	50	0	0	0	1	t	f	2025-10-12 20:01:37.47	2025-11-03 12:51:16.253	COMPLETED
88	3	338	0	2	\N	50	0	0	0	10	t	f	2025-10-12 20:01:44.557	2025-11-03 12:51:16.254	COMPLETED
90	3	340	1	1	\N	50	0	0	0	4	t	f	2025-10-12 20:02:01.779	2025-11-03 12:51:16.263	COMPLETED
171	2	1801	2	1	\N	50	0	0	0	0	f	f	2025-10-25 14:49:30.031	2025-10-25 14:49:30.031	NOT_PLAYED_YET
146	3	377	1	2	\N	50	0	0	0	4	t	f	2025-10-24 22:24:08.917	2025-11-03 12:51:16.27	COMPLETED
172	2	1802	2	0	\N	50	0	0	0	0	f	f	2025-10-25 14:49:38.416	2025-10-25 14:49:38.416	NOT_PLAYED_YET
173	2	1803	3	0	\N	50	0	0	0	0	f	f	2025-10-25 14:49:44.58	2025-10-25 14:49:44.58	NOT_PLAYED_YET
174	2	1804	1	0	\N	50	0	0	0	0	f	f	2025-10-25 14:49:52.501	2025-10-25 14:49:52.501	NOT_PLAYED_YET
175	2	1805	1	2	\N	50	0	0	0	0	f	f	2025-10-25 14:50:00.654	2025-10-25 14:50:00.654	NOT_PLAYED_YET
176	2	1806	1	3	\N	50	0	0	0	0	f	f	2025-10-25 14:50:10.44	2025-10-25 14:50:10.44	NOT_PLAYED_YET
177	2	1807	2	1	\N	50	0	0	0	0	f	f	2025-10-25 14:50:17.266	2025-10-25 14:50:17.266	NOT_PLAYED_YET
178	2	1808	1	3	\N	50	0	0	0	0	f	f	2025-10-25 14:50:23.422	2025-10-25 14:50:23.422	NOT_PLAYED_YET
179	2	1809	1	3	\N	50	0	0	0	0	f	f	2025-10-25 14:50:29.912	2025-10-25 14:50:29.912	NOT_PLAYED_YET
180	2	1810	1	2	\N	50	0	0	0	0	f	f	2025-10-25 14:50:35.603	2025-10-25 14:50:43.981	NOT_PLAYED_YET
181	2	1811	4	0	\N	50	0	0	0	0	f	f	2025-10-25 14:50:51.15	2025-10-25 14:50:51.15	NOT_PLAYED_YET
182	2	1812	3	1	\N	50	0	0	0	0	f	f	2025-10-25 14:50:57.957	2025-10-25 14:50:57.957	NOT_PLAYED_YET
183	2	1813	0	3	\N	50	0	0	0	0	f	f	2025-10-25 14:51:03.241	2025-10-25 14:51:03.241	NOT_PLAYED_YET
184	2	1814	2	2	\N	50	0	0	0	0	f	f	2025-10-25 14:51:08.379	2025-10-25 14:51:08.379	NOT_PLAYED_YET
185	2	1815	2	1	\N	50	0	0	0	0	f	f	2025-10-25 14:51:13.712	2025-10-25 14:51:13.712	NOT_PLAYED_YET
186	2	1816	1	3	\N	50	0	0	0	0	f	f	2025-10-25 14:51:19.058	2025-10-25 14:51:19.058	NOT_PLAYED_YET
187	2	1817	2	0	\N	50	0	0	0	0	f	f	2025-10-25 14:51:26.131	2025-10-25 14:51:26.131	NOT_PLAYED_YET
188	2	1829	2	0	\N	50	0	0	0	0	f	f	2025-10-25 14:51:40.83	2025-10-25 14:51:40.83	NOT_PLAYED_YET
189	2	1830	3	1	\N	50	0	0	0	0	f	f	2025-10-25 14:51:46.058	2025-10-25 14:51:46.058	NOT_PLAYED_YET
190	2	1834	1	4	\N	50	0	0	0	0	f	f	2025-10-25 14:51:53.641	2025-10-25 14:51:53.641	NOT_PLAYED_YET
191	2	1853	3	2	\N	50	0	0	0	0	f	f	2025-10-25 14:52:11.333	2025-10-25 14:52:11.333	NOT_PLAYED_YET
150	2	1639	0	3	\N	50	0	0	0	10	t	f	2025-10-24 22:37:51.112	2025-11-03 12:51:16.243	COMPLETED
149	3	1643	3	2	\N	50	0	0	0	4	t	f	2025-10-24 22:24:58.627	2025-11-03 12:51:16.244	COMPLETED
160	2	1643	3	1	\N	50	0	0	0	3	t	f	2025-10-24 23:11:29.931	2025-11-03 12:51:16.244	COMPLETED
130	3	360	2	1	\N	50	0	0	0	0	t	f	2025-10-24 22:19:05.366	2025-11-03 12:51:16.214	COMPLETED
151	2	360	2	0	\N	50	0	0	0	0	t	f	2025-10-24 23:09:19.002	2025-11-03 12:51:16.214	COMPLETED
131	3	361	1	1	\N	50	0	0	0	1	t	f	2025-10-24 22:19:16.299	2025-11-03 12:51:16.215	COMPLETED
152	2	361	2	1	\N	50	0	0	0	4	t	f	2025-10-24 23:09:32.794	2025-11-03 12:51:16.216	COMPLETED
153	2	362	1	0	\N	50	0	0	0	2	t	f	2025-10-24 23:09:50.487	2025-11-03 12:51:16.217	COMPLETED
154	2	363	1	3	\N	50	0	0	0	4	t	f	2025-10-24 23:10:00.657	2025-11-03 12:51:16.219	COMPLETED
155	2	364	2	2	\N	50	0	0	0	4	t	f	2025-10-24 23:10:10.788	2025-11-03 12:51:16.22	COMPLETED
156	2	365	3	1	\N	50	0	0	0	4	t	f	2025-10-24 23:10:17.172	2025-11-03 12:51:16.221	COMPLETED
157	2	366	1	1	\N	50	0	0	0	0	t	f	2025-10-24 23:10:29.578	2025-11-03 12:51:16.223	COMPLETED
158	2	367	1	1	\N	50	0	0	0	1	t	f	2025-10-24 23:10:44.81	2025-11-03 12:51:16.225	COMPLETED
112	2	286	2	0	\N	50	0	0	0	2	t	f	2025-10-12 20:18:13.772	2025-11-03 12:51:16.232	COMPLETED
148	3	1639	1	4	\N	50	0	0	0	4	t	f	2025-10-24 22:24:48.107	2025-11-03 12:51:16.242	COMPLETED
159	2	368	1	2	\N	50	0	0	0	4	t	f	2025-10-24 23:10:50.803	2025-11-03 12:51:16.246	COMPLETED
161	2	370	2	0	\N	50	0	0	0	4	t	f	2025-10-24 23:11:58.872	2025-11-03 12:51:16.249	COMPLETED
162	2	371	2	1	\N	50	0	0	0	2	t	f	2025-10-24 23:12:06.388	2025-11-03 12:51:16.251	COMPLETED
75	3	288	1	1	\N	50	0	0	0	0	t	f	2025-10-12 19:59:35.501	2025-11-03 12:51:16.256	COMPLETED
163	2	372	2	1	\N	50	0	0	0	3	t	f	2025-10-24 23:12:14.503	2025-11-03 12:51:16.26	COMPLETED
164	2	373	0	2	\N	50	0	0	0	1	t	f	2025-10-24 23:12:25.581	2025-11-03 12:51:16.265	COMPLETED
142	3	373	1	3	\N	50	0	0	0	0	t	f	2025-10-24 22:23:01.302	2025-11-03 12:51:16.265	COMPLETED
144	3	375	2	0	\N	50	0	0	0	10	t	f	2025-10-24 22:23:34.566	2025-11-03 12:51:16.266	COMPLETED
166	2	375	3	1	\N	50	0	0	0	4	t	f	2025-10-24 23:12:40.423	2025-11-03 12:51:16.267	COMPLETED
167	2	376	0	3	\N	50	0	0	0	0	t	f	2025-10-24 23:12:46.604	2025-11-03 12:51:16.268	COMPLETED
145	3	376	1	4	\N	50	0	0	0	1	t	f	2025-10-24 22:23:52.76	2025-11-03 12:51:16.268	COMPLETED
143	3	374	2	1	\N	50	0	0	0	4	t	f	2025-10-24 22:23:16.147	2025-11-03 12:51:16.269	COMPLETED
165	2	374	1	0	\N	50	0	0	0	10	t	f	2025-10-24 23:12:30.462	2025-11-03 12:51:16.269	COMPLETED
242	3	1611	2	2	\N	50	0	0	0	10	t	f	2025-10-30 21:59:30.706	2025-11-03 12:51:16.279	COMPLETED
207	2	1612	2	2	\N	50	0	0	0	0	t	f	2025-10-30 21:50:05.014	2025-11-03 12:51:16.281	COMPLETED
243	3	1612	2	1	\N	50	0	0	0	1	t	f	2025-10-30 21:59:38.605	2025-11-03 12:51:16.281	COMPLETED
235	3	1624	4	1	\N	50	0	0	0	4	t	f	2025-10-30 21:58:20.858	2025-11-03 12:51:16.212	COMPLETED
201	2	1626	1	1	\N	50	0	0	0	0	f	f	2025-10-30 21:49:16.236	2025-10-30 21:49:16.236	NOT_PLAYED_YET
211	2	1616	2	1	\N	50	0	0	0	0	f	f	2025-10-30 21:52:27.1	2025-10-30 21:52:32.152	NOT_PLAYED_YET
212	3	1800	0	3	\N	50	0	0	0	0	f	f	2025-10-30 21:53:36.866	2025-10-30 21:53:36.866	NOT_PLAYED_YET
213	3	1801	2	1	\N	50	0	0	0	0	f	f	2025-10-30 21:53:45.122	2025-10-30 21:53:45.122	NOT_PLAYED_YET
214	3	1802	2	1	\N	50	0	0	0	0	f	f	2025-10-30 21:53:53.146	2025-10-30 21:53:53.146	NOT_PLAYED_YET
215	3	1803	4	2	\N	50	0	0	0	0	f	f	2025-10-30 21:54:28.246	2025-10-30 21:54:28.246	NOT_PLAYED_YET
216	3	1804	3	2	\N	50	0	0	0	0	f	f	2025-10-30 21:54:36.053	2025-10-30 21:54:36.053	NOT_PLAYED_YET
217	3	1805	0	2	\N	50	0	0	0	0	f	f	2025-10-30 21:54:45.009	2025-10-30 21:54:45.009	NOT_PLAYED_YET
218	3	1808	2	3	\N	50	0	0	0	0	f	f	2025-10-30 21:55:16.599	2025-10-30 21:55:16.599	NOT_PLAYED_YET
219	3	1809	0	3	\N	50	0	0	0	0	f	f	2025-10-30 21:55:27.128	2025-10-30 21:55:27.128	NOT_PLAYED_YET
220	3	1810	1	4	\N	50	0	0	0	0	f	f	2025-10-30 21:55:36.084	2025-10-30 21:55:36.084	NOT_PLAYED_YET
221	3	1811	3	0	\N	50	0	0	0	0	f	f	2025-10-30 21:55:46.893	2025-10-30 21:55:46.893	NOT_PLAYED_YET
222	3	1812	3	2	\N	50	0	0	0	0	f	f	2025-10-30 21:55:57.807	2025-10-30 21:55:57.807	NOT_PLAYED_YET
223	3	1813	1	3	\N	50	0	0	0	0	f	f	2025-10-30 21:56:08.111	2025-10-30 21:56:08.111	NOT_PLAYED_YET
224	3	1814	1	1	\N	50	0	0	0	0	f	f	2025-10-30 21:56:15.109	2025-10-30 21:56:15.109	NOT_PLAYED_YET
225	3	1815	3	1	\N	50	0	0	0	0	f	f	2025-10-30 21:56:23.869	2025-10-30 21:56:23.869	NOT_PLAYED_YET
226	3	1816	0	2	\N	50	0	0	0	0	f	f	2025-10-30 21:56:33.823	2025-10-30 21:56:33.823	NOT_PLAYED_YET
227	3	1817	3	1	\N	50	0	0	0	0	f	f	2025-10-30 21:56:41.698	2025-10-30 21:56:41.698	NOT_PLAYED_YET
237	3	1626	1	2	\N	50	0	0	0	0	f	f	2025-10-30 21:58:36.63	2025-10-30 21:58:36.63	NOT_PLAYED_YET
247	3	1616	1	1	\N	50	0	0	0	0	f	f	2025-10-30 22:00:10.997	2025-10-30 22:00:10.997	NOT_PLAYED_YET
248	3	1806	2	2	\N	50	0	0	0	0	f	f	2025-10-30 22:00:26.094	2025-10-30 22:00:26.094	NOT_PLAYED_YET
249	3	1807	3	3	\N	50	0	0	0	0	f	f	2025-10-30 22:00:33.058	2025-10-30 22:00:33.058	NOT_PLAYED_YET
196	2	1621	4	0	\N	50	0	0	0	10	t	f	2025-10-30 21:48:37.138	2025-11-03 12:51:16.208	COMPLETED
232	3	1621	2	0	\N	50	0	0	0	4	t	f	2025-10-30 21:57:57.323	2025-11-03 12:51:16.208	COMPLETED
202	2	1607	2	0	\N	50	0	0	0	4	t	f	2025-10-30 21:49:26.443	2025-11-03 12:51:16.275	COMPLETED
239	3	1608	2	1	\N	50	0	0	0	4	t	f	2025-10-30 21:59:02.679	2025-11-03 12:51:16.276	COMPLETED
203	2	1608	2	0	\N	50	0	0	0	10	t	f	2025-10-30 21:49:35.922	2025-11-03 12:51:16.276	COMPLETED
204	2	1609	0	2	\N	50	0	0	0	10	t	f	2025-10-30 21:49:42.733	2025-11-03 12:51:16.277	COMPLETED
208	2	1613	2	1	\N	50	0	0	0	4	t	f	2025-10-30 21:50:11.962	2025-11-03 12:51:16.299	COMPLETED
244	3	1613	3	1	\N	50	0	0	0	4	t	f	2025-10-30 21:59:45.601	2025-11-03 12:51:16.3	COMPLETED
209	2	1614	0	2	\N	50	0	0	0	0	t	f	2025-10-30 21:52:12.978	2025-11-03 12:51:16.301	COMPLETED
245	3	1614	0	3	\N	50	0	0	0	0	t	f	2025-10-30 21:59:52.984	2025-11-03 12:51:16.302	COMPLETED
210	2	1615	2	2	\N	50	0	0	0	2	t	f	2025-10-30 21:52:19.368	2025-11-03 12:51:16.302	COMPLETED
246	3	1615	2	2	\N	50	0	0	0	2	t	f	2025-10-30 21:59:59.491	2025-11-03 12:51:16.303	COMPLETED
192	2	1617	2	0	\N	50	0	0	0	4	t	f	2025-10-30 21:48:07.903	2025-11-03 12:51:16.202	COMPLETED
228	3	1617	2	2	\N	50	0	0	0	1	t	f	2025-10-30 21:57:21.51	2025-11-03 12:51:16.203	COMPLETED
193	2	1618	3	1	\N	50	0	0	0	5	t	f	2025-10-30 21:48:16.003	2025-11-03 12:51:16.204	COMPLETED
229	3	1618	1	2	\N	50	0	0	0	0	t	f	2025-10-30 21:57:31.543	2025-11-03 12:51:16.204	COMPLETED
194	2	1619	2	1	\N	50	0	0	0	5	t	f	2025-10-30 21:48:23.054	2025-11-03 12:51:16.205	COMPLETED
230	3	1619	3	2	\N	50	0	0	0	4	t	f	2025-10-30 21:57:41.515	2025-11-03 12:51:16.205	COMPLETED
195	2	1620	0	1	\N	50	0	0	0	0	t	f	2025-10-30 21:48:29.802	2025-11-03 12:51:16.206	COMPLETED
231	3	1620	1	2	\N	50	0	0	0	1	t	f	2025-10-30 21:57:48.756	2025-11-03 12:51:16.207	COMPLETED
197	2	1622	1	1	\N	50	0	0	0	1	t	f	2025-10-30 21:48:43.588	2025-11-03 12:51:16.209	COMPLETED
233	3	1622	2	1	\N	50	0	0	0	2	t	f	2025-10-30 21:58:05.219	2025-11-03 12:51:16.209	COMPLETED
198	2	1623	1	2	\N	50	0	0	0	2	t	f	2025-10-30 21:48:49.948	2025-11-03 12:51:16.21	COMPLETED
234	3	1623	0	1	\N	50	0	0	0	1	t	f	2025-10-30 21:58:13.379	2025-11-03 12:51:16.211	COMPLETED
199	2	1624	2	0	\N	50	0	0	0	4	t	f	2025-10-30 21:48:56.054	2025-11-03 12:51:16.211	COMPLETED
200	2	1625	2	0	\N	50	0	0	0	4	t	f	2025-10-30 21:49:09.508	2025-11-03 12:51:16.212	COMPLETED
236	3	1625	3	1	\N	50	0	0	0	4	t	f	2025-10-30 21:58:30.151	2025-11-03 12:51:16.213	COMPLETED
168	2	377	0	2	\N	50	0	0	0	3	t	f	2025-10-24 23:12:52.04	2025-11-03 12:51:16.271	COMPLETED
147	3	378	1	2	\N	50	0	0	0	5	t	f	2025-10-24 22:24:28.318	2025-11-03 12:51:16.271	COMPLETED
169	2	378	2	2	\N	50	0	0	0	0	t	f	2025-10-24 23:12:59.594	2025-11-03 12:51:16.272	COMPLETED
238	3	1607	3	1	\N	50	0	0	0	4	t	f	2025-10-30 21:58:55.572	2025-11-03 12:51:16.275	COMPLETED
240	3	1609	0	3	\N	50	0	0	0	4	t	f	2025-10-30 21:59:10.014	2025-11-03 12:51:16.278	COMPLETED
241	3	1610	1	1	\N	50	0	0	0	0	t	f	2025-10-30 21:59:17.972	2025-11-03 12:51:16.278	COMPLETED
205	2	1610	2	1	\N	50	0	0	0	5	t	f	2025-10-30 21:49:53.63	2025-11-03 12:51:16.279	COMPLETED
206	2	1611	1	3	\N	50	0	0	0	2	t	f	2025-10-30 21:49:59.84	2025-11-03 12:51:16.28	COMPLETED
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "userId", token, "ipAddress", "userAgent", "expiresAt", "createdAt") FROM stdin;
cmhj54u3b0005l85kvxabyqi9	2	5dcbb14704c2fffc33a359c99a65b28d4db6649e1061fc9b01ba9c3af6d7701f	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0	2025-11-10 12:53:10.87	2025-11-03 12:53:10.872
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Table" (id, "leagueId", "teamId", "position", played, won, drawn, lost, "goalsFor", "goalsAgainst", "goalDifference", points, form, "nextOpponentId", "lastUpdatedGameWeek", "updatedAt") FROM stdin;
492	3	55	3	8	6	0	2	13	7	6	18	WWWWW	\N	\N	2025-10-27 20:59:49.567
490	3	51	4	8	5	2	1	14	6	8	17	WWDLW	\N	\N	2025-10-27 20:59:49.567
2112	4	63	11	8	2	5	1	9	10	-1	11	DDLDD	\N	\N	2025-10-27 20:59:35.984
2124	4	77	12	8	3	2	3	8	14	-6	11	LLDWW	\N	\N	2025-10-27 20:59:35.985
493	3	43	5	8	5	2	1	18	11	7	17	DWWWW	\N	\N	2025-10-27 20:59:49.568
495	3	44	6	8	4	1	3	21	18	3	13	LWLDW	\N	\N	2025-10-27 20:59:49.569
458	1	11	5	10	5	2	3	17	16	1	17	LWWWD	\N	\N	2025-11-01 17:47:56.805
2380	5	51	6	3	2	1	0	12	7	5	7	DWW	\N	\N	2025-10-27 20:59:54.822
2382	5	84	13	3	2	0	1	6	5	1	6	WWL	\N	\N	2025-10-27 20:59:54.826
460	1	1	8	10	4	3	3	17	15	2	15	WDWLW	\N	\N	2025-11-01 17:47:56.807
461	1	20	10	9	4	3	2	9	8	1	15	DWWWW	\N	\N	2025-11-01 17:47:56.808
469	2	29	1	10	9	0	1	22	10	12	27	WLWWW	\N	\N	2025-11-01 17:47:53.533
471	2	39	2	11	7	2	2	22	10	12	23	WLDWW	\N	\N	2025-11-01 17:47:53.533
470	2	37	3	10	7	1	2	25	12	13	22	WWLWL	\N	\N	2025-11-01 17:47:53.534
473	2	26	4	11	6	4	1	21	10	11	22	WDWWW	\N	\N	2025-11-01 17:47:53.535
477	2	36	5	10	5	3	2	14	11	3	18	DDLWW	\N	\N	2025-11-01 17:47:53.535
472	2	24	7	10	4	4	2	15	12	3	16	WWWDL	\N	\N	2025-11-01 17:47:53.536
464	1	12	12	10	4	1	5	14	16	-2	13	WLWWL	\N	\N	2025-11-01 17:47:56.809
475	2	32	8	10	3	5	2	11	10	1	14	DWLDL	\N	\N	2025-11-01 17:47:53.537
462	1	9	14	10	3	2	5	12	14	-2	11	LLLLW	\N	\N	2025-11-01 17:47:56.81
2107	4	76	13	8	3	1	4	8	9	-1	10	LWWDL	\N	\N	2025-10-27 20:59:35.986
2113	4	61	14	8	2	3	3	8	10	-2	9	WLDLD	\N	\N	2025-10-27 20:59:35.987
2118	4	73	15	8	1	4	3	3	7	-4	7	DWLDD	\N	\N	2025-10-27 20:59:35.988
2122	4	66	17	8	0	5	3	4	11	-7	5	DLLDD	\N	\N	2025-10-27 20:59:35.99
499	3	48	7	8	4	1	3	15	13	2	13	LDLWW	\N	\N	2025-10-27 20:59:49.569
2114	4	64	18	8	0	4	4	7	12	-5	4	LDLLD	\N	\N	2025-10-27 20:59:35.991
2120	4	74	19	8	0	4	4	5	12	-7	4	LDLDD	\N	\N	2025-10-27 20:59:35.992
476	2	28	9	10	4	2	4	9	10	-1	14	DLWDL	\N	\N	2025-11-01 17:47:53.538
2105	4	65	20	8	0	3	5	4	11	-7	3	LLLDL	\N	\N	2025-10-27 20:59:35.993
494	3	57	8	8	3	2	3	12	11	1	11	LLWDL	\N	\N	2025-10-27 20:59:49.57
505	3	46	18	8	0	3	5	6	18	-12	3	DLDLL	\N	\N	2025-10-27 20:59:49.576
456	1	8	15	9	3	2	4	9	12	-3	11	LDWLL	\N	\N	2025-11-01 17:47:56.811
482	2	34	10	11	4	2	5	11	14	-3	14	LWWWL	\N	\N	2025-11-01 17:47:53.538
463	1	13	16	10	3	2	5	9	17	-8	11	DLLWL	\N	\N	2025-11-01 17:47:56.811
474	2	35	11	11	4	1	6	17	19	-2	13	WWLLL	\N	\N	2025-11-01 17:47:53.539
466	1	7	17	10	3	1	6	12	19	-7	10	LLWWL	\N	\N	2025-11-01 17:47:56.812
478	2	31	12	10	3	3	4	9	9	0	12	DLWDL	\N	\N	2025-11-01 17:47:53.539
465	1	14	18	10	1	3	6	7	19	-12	6	LLLLD	\N	\N	2025-11-01 17:47:56.813
2383	5	4	15	3	1	2	0	3	2	1	5	WDD	\N	\N	2025-10-27 20:59:54.827
2377	5	86	16	3	1	1	1	8	6	2	4	LDW	\N	\N	2025-10-27 20:59:54.828
489	3	41	1	8	8	0	0	30	4	26	24	WWWWW	\N	\N	2025-10-27 20:59:49.566
2375	5	28	21	3	1	0	2	4	7	-3	3	LLW	\N	\N	2025-10-27 20:59:54.832
2119	4	59	7	8	2	6	0	12	6	6	12	WDDDD	\N	\N	2025-10-27 20:59:35.981
2117	4	68	8	8	3	3	2	9	8	1	12	DDDLL	\N	\N	2025-10-27 20:59:35.982
2116	4	69	10	8	3	2	3	11	7	4	11	LWDDW	\N	\N	2025-10-27 20:59:35.983
491	3	52	2	8	6	1	1	16	9	7	19	WWDWW	\N	\N	2025-10-27 20:59:49.566
2378	5	92	24	3	1	0	2	3	9	-6	3	WLL	\N	\N	2025-10-27 20:59:54.834
2379	5	68	25	3	0	2	1	6	7	-1	2	DDL	\N	\N	2025-10-27 20:59:54.835
2384	5	39	31	3	0	1	2	2	5	-3	1	LDL	\N	\N	2025-10-27 20:59:54.838
2381	5	91	35	3	0	0	3	2	7	-5	0	LLL	\N	\N	2025-10-27 20:59:54.841
2376	5	5	4	3	3	0	0	8	0	8	9	WWW	\N	\N	2025-10-27 20:59:54.821
449	1	5	1	10	8	1	1	18	3	15	25	WWWWW	\N	\N	2025-11-01 17:47:56.802
452	1	6	2	9	5	3	1	16	11	5	18	DDWDW	\N	\N	2025-11-01 17:47:56.803
451	1	4	3	9	5	2	2	17	7	10	17	DDWLW	\N	\N	2025-11-01 17:47:56.804
457	1	3	4	9	5	2	2	11	7	4	17	DWLWW	\N	\N	2025-11-01 17:47:56.804
453	1	19	6	9	5	1	3	17	7	10	16	DWWWL	\N	\N	2025-11-01 17:47:56.805
454	1	17	7	10	4	4	2	14	9	5	16	WLDLW	\N	\N	2025-11-01 17:47:56.806
450	1	15	9	9	5	0	4	16	14	2	15	WLLLL	\N	\N	2025-11-01 17:47:56.807
455	1	10	11	9	4	2	3	17	11	6	14	LLWWL	\N	\N	2025-11-01 17:47:56.808
459	1	16	13	9	3	3	3	9	8	1	12	DLWLW	\N	\N	2025-11-01 17:47:56.81
467	1	2	19	9	1	1	7	7	20	-13	4	LDLLL	\N	\N	2025-11-01 17:47:56.813
500	3	56	9	8	3	2	3	12	16	-4	11	LLWDW	\N	\N	2025-10-27 20:59:49.57
468	1	18	20	10	0	2	8	7	22	-15	2	DDLLL	\N	\N	2025-11-01 17:47:56.814
481	2	21	15	10	2	3	5	14	17	-3	9	LDWLD	\N	\N	2025-11-01 17:47:53.541
485	2	22	19	10	2	1	7	7	19	-12	7	LWLLD	\N	\N	2025-11-01 17:47:53.543
501	3	53	10	8	3	1	4	11	15	-4	10	WDLWL	\N	\N	2025-10-27 20:59:49.571
496	3	50	11	8	2	3	3	11	13	-2	9	WDDDL	\N	\N	2025-10-27 20:59:49.571
503	3	58	12	8	2	2	4	9	13	-4	8	LLLLW	\N	\N	2025-10-27 20:59:49.572
497	3	45	13	8	2	2	4	7	11	-4	8	WDWLL	\N	\N	2025-10-27 20:59:49.573
498	3	49	14	8	2	1	5	8	14	-6	7	LLLLL	\N	\N	2025-10-27 20:59:49.573
502	3	42	15	8	2	1	5	12	20	-8	7	LLWDL	\N	\N	2025-10-27 20:59:49.574
504	3	54	16	8	1	1	6	9	16	-7	4	WLLLL	\N	\N	2025-10-27 20:59:49.575
506	3	47	17	8	1	1	6	7	16	-9	4	LWLDL	\N	\N	2025-10-27 20:59:49.575
2108	4	72	1	8	6	0	2	15	8	7	18	WLWLW	\N	\N	2025-10-27 20:59:35.977
2109	4	75	2	8	6	0	2	8	3	5	18	WWWLW	\N	\N	2025-10-27 20:59:35.978
2111	4	71	3	8	5	2	1	13	6	7	17	WWDWD	\N	\N	2025-10-27 20:59:35.978
2123	4	67	4	8	5	0	3	19	11	8	15	WWWWL	\N	\N	2025-10-27 20:59:35.979
2110	4	60	5	8	4	2	2	13	7	6	14	WDWWD	\N	\N	2025-10-27 20:59:35.98
2115	4	62	6	8	3	4	1	9	5	4	13	WDDWD	\N	\N	2025-10-27 20:59:35.98
2121	4	78	9	8	3	3	2	10	12	-2	12	LLDDW	\N	\N	2025-10-27 20:59:35.982
2106	4	70	16	8	1	3	4	7	13	-6	6	LDWDL	\N	\N	2025-10-27 20:59:35.989
2395	5	81	1	3	3	0	0	13	3	10	9	WWW	\N	\N	2025-10-27 20:59:54.819
2397	5	41	2	3	3	0	0	12	2	10	9	WWW	\N	\N	2025-10-27 20:59:54.82
2392	5	67	3	3	3	0	0	9	0	9	9	WWW	\N	\N	2025-10-27 20:59:54.821
2385	5	29	5	3	3	0	0	8	1	7	9	WWW	\N	\N	2025-10-27 20:59:54.822
2387	5	89	28	3	0	2	1	2	5	-3	2	DLD	\N	\N	2025-10-27 20:59:54.837
2390	5	95	29	3	0	2	1	1	5	-4	2	DLD	\N	\N	2025-10-27 20:59:54.837
2400	5	43	30	3	0	2	1	5	10	-5	2	DDL	\N	\N	2025-10-27 20:59:54.838
2399	5	90	32	3	0	1	2	4	8	-4	1	DLL	\N	\N	2025-10-27 20:59:54.839
2389	5	85	33	3	0	1	2	1	8	-7	1	DLL	\N	\N	2025-10-27 20:59:54.839
2410	5	94	34	3	0	1	2	1	9	-8	1	LLD	\N	\N	2025-10-27 20:59:54.84
2391	5	87	36	3	0	0	3	1	11	-10	0	LLL	\N	\N	2025-10-27 20:59:54.841
2398	5	10	11	3	2	0	1	7	4	3	6	LWW	\N	\N	2025-10-27 20:59:54.825
2409	5	79	12	3	2	0	1	7	4	3	6	WLW	\N	\N	2025-10-27 20:59:54.826
2408	5	83	14	3	2	0	1	5	6	-1	6	LWW	\N	\N	2025-10-27 20:59:54.827
2396	5	59	17	3	1	1	1	2	5	-3	4	LWD	\N	\N	2025-10-27 20:59:54.829
2386	5	80	18	3	1	0	2	6	4	2	3	LWL	\N	\N	2025-10-27 20:59:54.829
2394	5	26	19	3	1	0	2	7	8	-1	3	LWL	\N	\N	2025-10-27 20:59:54.83
2401	5	88	20	3	1	0	2	5	7	-2	3	WLL	\N	\N	2025-10-27 20:59:54.831
2407	5	44	22	3	1	0	2	7	11	-4	3	WLL	\N	\N	2025-10-27 20:59:54.833
2406	5	72	23	3	1	0	2	4	9	-5	3	LWL	\N	\N	2025-10-27 20:59:54.834
2388	5	93	26	3	0	2	1	5	7	-2	2	DDL	\N	\N	2025-10-27 20:59:54.835
2402	5	82	27	3	0	2	1	3	6	-3	2	LDD	\N	\N	2025-10-27 20:59:54.836
479	2	25	6	11	5	2	4	12	13	-1	17	DLLWW	\N	\N	2025-11-01 17:47:53.536
484	2	33	13	10	1	7	2	11	13	-2	10	DLDDW	\N	\N	2025-11-01 17:47:53.54
480	2	27	14	10	3	1	6	9	12	-3	10	DLWLL	\N	\N	2025-11-01 17:47:53.54
488	2	30	16	10	2	3	5	11	15	-4	9	LWLWD	\N	\N	2025-11-01 17:47:53.542
487	2	38	17	10	2	3	5	10	14	-4	9	WLLDW	\N	\N	2025-11-01 17:47:53.542
483	2	40	18	10	2	3	5	10	16	-6	9	DLLDL	\N	\N	2025-11-01 17:47:53.543
486	2	23	20	11	1	4	6	10	24	-14	7	DWLDL	\N	\N	2025-11-01 17:47:53.544
2405	5	19	7	3	2	1	0	6	2	4	7	WDW	\N	\N	2025-10-27 20:59:54.823
2403	5	16	8	3	2	0	1	8	2	6	6	LWW	\N	\N	2025-10-27 20:59:54.823
2404	5	37	9	3	2	0	1	9	4	5	6	WLW	\N	\N	2025-10-27 20:59:54.824
2393	5	15	10	3	2	0	1	8	4	4	6	WLW	\N	\N	2025-10-27 20:59:54.825
\.


--
-- Data for Name: TableSnapshot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TableSnapshot" (id, "gameWeekId", "teamId", "position", played, won, drawn, lost, "goalsFor", "goalsAgainst", "goalDifference", points, form, "createdAt") FROM stdin;
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Team" (id, name, "shortName", code, "logoUrl", "stadiumName", "foundedYear", website, "primaryColor", "createdAt", "updatedAt", "apiName") FROM stdin;
82	AS Monaco FC	Monaco	AS 	/logos/ucl/as-monaco-fc.png	Stade Louis II.	1919	http://www.asmonaco.com	Red	2025-10-25 11:53:56.316	2025-10-25 12:30:26.582	AS Monaco FC
83	Galatasaray SK	Galatasaray	GAL	/logos/ucl/galatasaray-sk.png	Türk Telekom Arena	1905	http://www.galatasaray.org	Red	2025-10-25 11:53:56.32	2025-10-25 12:30:26.604	Galatasaray SK
84	Qarabağ Ağdam FK	Qarabağ Ağdam	QAA	/logos/ucl/qaraba-adam-fk.png	Tofiq Bəhramov adına Respublika stadionu	1951	http://www.qarabagh.com	Black	2025-10-25 11:53:56.325	2025-10-25 12:30:26.627	Qarabağ Ağdam FK
85	PAE Olympiakos SFP	Olympiakos	POS	/logos/ucl/pae-olympiakos-sfp.png	Stadio Georgios Karaiskáki	1925	http://www.olympiacos.org	Red	2025-10-25 11:53:56.329	2025-10-25 12:30:26.65	PAE Olympiakos SFP
86	PSV	PSV	PSV	/logos/ucl/psv.png	Philips Stadion	1913	http://www.psv.nl	Red	2025-10-25 11:53:56.332	2025-10-25 12:30:26.666	PSV
87	AFC Ajax	Ajax	AAA	/logos/ucl/afc-ajax.png	Johan Cruyff ArenA	1900	http://www.ajax.nl	Red	2025-10-25 11:53:56.334	2025-10-25 12:30:26.69	AFC Ajax
88	Club Brugge KV	Club Brugge	CBB	/logos/ucl/club-brugge-kv.png	Jan Breydelstadion	1894	http://www.clubbrugge.be	Blue	2025-10-25 11:53:56.337	2025-10-25 12:30:26.711	Club Brugge KV
89	SK Slavia Praha	Slavia Praha	SPP	/logos/ucl/sk-slavia-praha.png	Sinobo Stadium	1892	http://www.slavia.cz	Red	2025-10-25 11:53:56.34	2025-10-25 12:30:26.733	SK Slavia Praha
80	Olympique de Marseille	Marseille	OMM	/logos/ucl/olympique-de-marseille.png	Orange Vélodrome	1898	http://www.om.net	White	2025-10-25 11:53:56.31	2025-10-25 12:30:26.538	Olympique de Marseille
5	Arsenal	Arsenal	ARS	/logos/premier-league/arsenal.svg	Emirates Stadium	1886	\N	#EF0107	2025-10-06 18:06:56.14	2025-10-24 21:54:24.168	Arsenal FC
6	Bournemouth	Bournemouth	BOU	/logos/premier-league/bournemouth.svg	Vitality Stadium	1899	\N	#DA291C	2025-10-06 18:06:56.14	2025-10-24 21:54:24.169	AFC Bournemouth
7	Burnley	Burnley	BUR	/logos/premier-league/burnley.svg	Turf Moor	1882	\N	#6C1D45	2025-10-06 18:06:56.14	2025-10-24 21:54:24.17	Burnley FC
8	Everton	Everton	EVE	/logos/premier-league/everton.svg	Goodison Park	1878	\N	#003399	2025-10-06 18:06:56.14	2025-10-24 21:54:24.171	Everton FC
18	Wolverhampton	Wolverhampton	WOL	/logos/premier-league/wolves.svg	Molineux Stadium	1877	\N	#FDB913	2025-10-06 18:06:56.141	2025-10-24 21:54:24.176	Wolverhampton Wanderers FC
19	Manchester City	Manchester City	MCI	/logos/premier-league/man-city.svg	Etihad Stadium	1880	\N	#6CABDD	2025-10-06 18:06:56.141	2025-10-24 21:54:24.177	Manchester City FC
20	Aston Villa	Aston Villa	AVL	/logos/premier-league/aston-villa.svg	Villa Park	1874	\N	#95BFE5	2025-10-06 18:06:56.14	2025-10-24 21:54:24.178	Aston Villa FC
24	Real Betis	Real Betis	BET	/logos/la-liga/real-betis.svg	Benito Villamarín	1907	\N	#00954C	2025-10-06 18:06:56.298	2025-10-24 22:08:52.102	Real Betis Balompié
28	Athletic Bilbao	Athletic Bilbao	ATH	/logos/la-liga/athletic-bilbao.svg	San Mamés	1898	\N	#EE2523	2025-10-06 18:06:56.298	2025-10-24 22:08:52.107	Athletic Club
29	Real Madrid	Real Madrid	RMA	/logos/la-liga/real-madrid.svg	Santiago Bernabéu	1902	\N	#FEBE10	2025-10-06 18:06:56.298	2025-10-24 22:08:52.108	Real Madrid CF
33	Celta Vigo	Celta Vigo	CEL	/logos/la-liga/celta-vigo.svg	Balaídos	1923	\N	#7AC5CD	2025-10-06 18:06:56.298	2025-10-24 22:08:52.109	RC Celta de Vigo
35	Sevilla	Sevilla	SEV	/logos/la-liga/sevilla.svg	Ramón Sánchez Pizjuán	1890	\N	#F43333	2025-10-06 18:06:56.3	2025-10-24 22:08:52.11	Sevilla FC
37	Barcelona	Barcelona	BAR	/logos/la-liga/barcelona.svg	Camp Nou	1899	\N	#004D98	2025-10-06 18:06:56.298	2025-10-24 22:08:52.111	FC Barcelona
38	Real Sociedad	Real Sociedad	RSO	/logos/la-liga/real-sociedad.svg	Reale Arena	1909	\N	#0A3A82	2025-10-06 18:06:56.3	2025-10-24 22:08:52.111	Real Sociedad de Fútbol
40	Valencia	Valencia	VAL	/logos/la-liga/valencia.svg	Mestalla	1919	\N	#F77F00	2025-10-06 18:06:56.3	2025-10-24 22:08:52.115	Valencia CF
43	Bayer Leverkusen	Bayer Leverkusen	B04	/logos/bundesliga/leverkusen.svg	BayArena	1904	\N	#E32221	2025-10-06 18:06:56.303	2025-10-24 22:10:55.485	Bayer 04 Leverkusen
51	Borussia Dortmund	Borussia Dortmund	BVB	/logos/bundesliga/dortmund.svg	Signal Iduna Park	1909	\N	#FDE100	2025-10-06 18:06:56.303	2025-10-24 22:10:55.49	Borussia Dortmund
53	Union Berlin	Union Berlin	FCU	/logos/bundesliga/union-berlin.svg	Stadion An der Alten Försterei	1966	\N	#EB1923	2025-10-06 18:06:56.303	2025-10-24 22:10:55.491	1. FC Union Berlin
13	Leeds United	Leeds United	LEE	/logos/premier-league/leeds.svg	Elland Road	1919	\N	#FFCD00	2025-10-06 18:06:56.141	2025-10-24 21:54:24.161	Leeds United FC
16	Newcastle United	Newcastle United	NEW	/logos/premier-league/newcastle.svg	St. James' Park	1892	\N	#241F20	2025-10-06 18:06:56.141	2025-10-24 21:54:24.163	Newcastle United FC
1	Brighton	Brighton	BHA	/logos/premier-league/brighton.svg	Falmer Stadium	1901	\N	#0057B8	2025-10-06 18:06:56.14	2025-10-24 21:54:24.164	Brighton & Hove Albion FC
2	West Ham	West Ham	WHU	/logos/premier-league/west-ham.svg	London Stadium	1895	\N	#7A263A	2025-10-06 18:06:56.141	2025-10-24 21:54:24.165	West Ham United FC
3	Sunderland	Sunderland	SUN	/logos/premier-league/sunderland.svg	Stadium of Light	1879	\N	#EB172B	2025-10-06 18:06:56.141	2025-10-24 21:54:24.166	Sunderland AFC
4	Tottenham	Tottenham	TOT	/logos/premier-league/tottenham.svg	Tottenham Hotspur Stadium	1882	\N	#132257	2025-10-06 18:06:56.141	2025-10-24 21:54:24.167	Tottenham Hotspur FC
9	Fulham	Fulham	FUL	/logos/premier-league/fulham.svg	Craven Cottage	1879	\N	#000000	2025-10-06 18:06:56.14	2025-10-24 21:54:24.171	Fulham FC
10	Chelsea	Chelsea	CHE	/logos/premier-league/chelsea.svg	Stamford Bridge	1905	\N	#034694	2025-10-06 18:06:56.14	2025-10-24 21:54:24.172	Chelsea FC
11	Manchester United	Manchester United	MUN	/logos/premier-league/man-united.svg	Old Trafford	1878	\N	#DA291C	2025-10-06 18:06:56.141	2025-10-24 21:54:24.173	Manchester United FC
12	Brentford	Brentford	BRE	/logos/premier-league/brentford.svg	Gtech Community Stadium	1889	\N	#E30613	2025-10-06 18:06:56.14	2025-10-24 21:54:24.174	Brentford FC
14	Nottingham Forest	Nottingham Forest	NFO	/logos/premier-league/nottingham-forest.svg	City Ground	1865	\N	#DD0000	2025-10-06 18:06:56.141	2025-10-24 21:54:24.174	Nottingham Forest FC
15	Liverpool	Liverpool	LIV	/logos/premier-league/liverpool.svg	Anfield	1892	\N	#C8102E	2025-10-06 18:06:56.141	2025-10-24 21:54:24.175	Liverpool FC
17	Crystal Palace	Crystal Palace	CRY	/logos/premier-league/crystal-palace.svg	Selhurst Park	1905	\N	#1B458F	2025-10-06 18:06:56.141	2025-10-24 21:54:24.176	Crystal Palace FC
54	Mainz 05	Mainz 05	M05	/logos/bundesliga/mainz.svg	MEWA Arena	1905	\N	#C3141E	2025-10-06 18:06:56.303	2025-10-24 22:10:55.492	1. FSV Mainz 05
50	SC Freiburg	SC Freiburg	SCF	/logos/bundesliga/freiburg.svg	Europa-Park Stadion	1904	\N	#E2001A	2025-10-06 18:06:56.303	2025-10-24 22:10:55.493	SC Freiburg
81	Paris Saint-Germain FC	PSG	PSS	/logos/ucl/paris-saint-germain-fc.png	Parc des Princes	1904	http://www.psg.fr	Red	2025-10-25 11:53:56.313	2025-10-25 12:30:26.56	Paris Saint-Germain FC
55	VfB Stuttgart	VfB Stuttgart	VFB	/logos/bundesliga/stuttgart.svg	Mercedes-Benz Arena	1893	\N	#E20613	2025-10-06 18:06:56.303	2025-10-24 22:10:55.494	VfB Stuttgart
90	FC København	København	FC 	/logos/ucl/fc-kbenhavn.png	Telia Parken	1992	http://www.fck.dk	White	2025-10-25 11:53:56.344	2025-10-25 12:30:26.75	FC København
91	Sport Lisboa e Benfica	SL Benfica	SLB	/logos/ucl/sport-lisboa-e-benfica.png	Estádio do Sport Lisboa e Benfica	1904	https://www.slbenfica.pt	\N	2025-10-25 11:53:56.347	2025-10-25 12:30:26.767	Sport Lisboa e Benfica
92	Royale Union Saint-Gilloise	Union SG	RUS	/logos/ucl/royale-union-saint-gilloise.png	Stade Joseph Mariën	1897	http://www.rusg.brussels	Blue	2025-10-25 11:53:56.351	2025-10-25 12:30:26.789	Royale Union Saint-Gilloise
93	FK Bodø/Glimt	Bodø/Glimt	FK 	/logos/ucl/fk-bodglimt.png	Aspmyra Stadion	1916	http://www.glimt.no	Yellow	2025-10-25 11:53:56.354	2025-10-25 12:30:26.811	FK Bodø/Glimt
94	FK Kairat	FK Kairat	FK 1	/logos/ucl/fk-kairat.png	\N	\N	\N	\N	2025-10-25 11:53:56.358	2025-10-25 12:30:26.833	FK Kairat
95	Paphos FC	Paphos FC	PAP	/logos/ucl/paphos-fc.png	Alphamega Stadium	\N	\N	\N	2025-10-25 11:53:56.361	2025-10-25 12:30:26.856	Paphos FC
39	Villarreal	Villarreal	VIL	/logos/la-liga/villarreal.svg	Estadio de la Cerámica	1923	\N	#FFE667	2025-10-06 18:06:56.3	2025-10-24 22:08:52.116	Villarreal CF
36	Espanyol	Espanyol	ESP	/logos/la-liga/espanyol.svg	RCDE Stadium	1900	\N	#0E7EBE	2025-10-06 18:06:56.298	2025-10-24 22:08:52.117	RCD Espanyol de Barcelona
34	Rayo Vallecano	Rayo Vallecano	RAY	/logos/la-liga/rayo-vallecano.svg	Vallecas	1924	\N	#E62932	2025-10-06 18:06:56.299	2025-10-24 22:08:52.118	Rayo Vallecano de Madrid
32	Elche	Elche	ELC	/logos/la-liga/elche.svg	Martínez Valero	1923	\N	#00814D	2025-10-06 18:06:56.298	2025-10-24 22:08:52.118	Elche CF
31	Deportivo Alavés	Deportivo Alavés	ALA	/logos/la-liga/alaves.svg	Mendizorroza	1921	\N	#0E4C92	2025-10-06 18:06:56.298	2025-10-24 22:08:52.119	Deportivo Alavés
30	Mallorca	Mallorca	MLL	/logos/la-liga/mallorca.svg	Visit Mallorca Estadi	1916	\N	#E20613	2025-10-06 18:06:56.298	2025-10-24 22:08:52.12	RCD Mallorca
27	Osasuna	Osasuna	OSA	/logos/la-liga/osasuna.svg	El Sadar	1920	\N	#D81E05	2025-10-06 18:06:56.298	2025-10-24 22:08:52.12	CA Osasuna
26	Atlético Madrid	Atlético Madrid	ATM	/logos/la-liga/atletico-madrid.svg	Wanda Metropolitano	1903	\N	#CB3524	2025-10-06 18:06:56.298	2025-10-24 22:08:52.121	Club Atlético de Madrid
25	Getafe	Getafe	GET	/logos/la-liga/getafe.svg	Coliseum Alfonso Pérez	1983	\N	#005999	2025-10-06 18:06:56.298	2025-10-24 22:08:52.122	Getafe CF
23	Girona	Girona	GIR	/logos/la-liga/girona.svg	Montilivi	1930	\N	#C7101F	2025-10-06 18:06:56.298	2025-10-24 22:08:52.123	Girona FC
22	Real Oviedo	Real Oviedo	OVI	/logos/la-liga/real-oviedo.svg	Carlos Tartiere	1926	\N	#0064B0	2025-10-06 18:06:56.299	2025-10-24 22:08:52.124	Real Oviedo
21	Levante	Levante	LEV	/logos/la-liga/levante.svg	Ciutat de València	1909	\N	#004F9E	2025-10-06 18:06:56.298	2025-10-24 22:08:52.124	Levante UD
49	St. Pauli	St. Pauli	STP	/logos/bundesliga/st-pauli.svg	Millerntor-Stadion	1910	\N	#492F20	2025-10-06 18:06:56.303	2025-10-24 22:10:55.494	FC St. Pauli 1910
48	TSG Hoffenheim	TSG Hoffenheim	HOF	/logos/bundesliga/hoffenheim.svg	PreZero Arena	1899	\N	#1961B5	2025-10-06 18:06:56.303	2025-10-24 22:10:55.496	TSG 1899 Hoffenheim
47	FC Heidenheim	FC Heidenheim	FCH	/logos/bundesliga/heidenheim.svg	Voith-Arena	1846	\N	#003C7D	2025-10-06 18:06:56.303	2025-10-24 22:10:55.497	1. FC Heidenheim 1846
46	Borussia Mönchengladbach	Borussia Mönchengladbach	BMG	/logos/bundesliga/gladbach.svg	Borussia-Park	1900	\N	#000000	2025-10-06 18:06:56.303	2025-10-24 22:10:55.497	Borussia Mönchengladbach
45	Hamburger SV	Hamburger SV	HSV	/logos/bundesliga/hamburg.svg	Volksparkstadion	1887	\N	#0066B2	2025-10-06 18:06:56.303	2025-10-24 22:10:55.498	Hamburger SV
44	Eintracht Frankfurt	Eintracht Frankfurt	SGE	/logos/bundesliga/frankfurt.svg	Deutsche Bank Park	1899	\N	#E1000F	2025-10-06 18:06:56.303	2025-10-24 22:10:55.499	Eintracht Frankfurt
42	FC Augsburg	FC Augsburg	AUG	/logos/bundesliga/augsburg.svg	WWK Arena	1907	\N	#BA3733	2025-10-06 18:06:56.303	2025-10-24 22:10:55.5	FC Augsburg
41	Bayern Munich	Bayern Munich	FCB	/logos/bundesliga/bayern.svg	Allianz Arena	1900	\N	#DC052D	2025-10-06 18:06:56.303	2025-10-24 22:10:55.5	FC Bayern München
79	Sporting Clube de Portugal	Sporting CP	SCP	/logos/ucl/sporting-clube-de-portugal.png	Estádio José Alvalade	1906	http://www.sporting.pt	Green	2025-10-25 11:53:56.304	2025-10-25 12:30:26.514	Sporting Clube de Portugal
59	Atalanta	Atalanta	ATA	/logos/serie-a/atalanta.svg	Stadio di Bergamo	1907	\N	\N	2025-10-12 09:33:40.578	2025-10-24 22:14:33.74	Atalanta BC
60	Bologna FC	Bologna	BOL	/logos/serie-a/bologna.svg	Stadio Renato Dall'Ara	1909	\N	\N	2025-10-12 09:33:40.581	2025-10-24 22:14:33.745	Bologna FC 1909
61	Cagliari Calcio	Cagliari	CAG	/logos/serie-a/cagliari.svg	Unipol Domus	1920	\N	\N	2025-10-12 09:33:40.582	2025-10-24 22:14:33.745	Cagliari Calcio
62	Como 1907	Como	COM	/logos/serie-a/como.svg	Stadio Giuseppe Sinigaglia	1907	\N	\N	2025-10-12 09:33:40.583	2025-10-24 22:14:33.746	Como 1907
63	US Cremonese	Cremonese	CRE	/logos/serie-a/cremonese.svg	Stadio Giovanni Zini	1903	\N	\N	2025-10-12 09:33:40.584	2025-10-24 22:14:33.747	US Cremonese
64	ACF Fiorentina	Fiorentina	FIO	/logos/serie-a/fiorentina.svg	Stadio Artemio Franchi	1926	\N	\N	2025-10-12 09:33:40.584	2025-10-24 22:14:33.748	ACF Fiorentina
65	Genoa CFC	Genoa	GEN	/logos/serie-a/genoa.svg	Stadio Luigi Ferraris	1893	\N	\N	2025-10-12 09:33:40.586	2025-10-24 22:14:33.749	Genoa CFC
66	Hellas Verona	Verona	VER	/logos/serie-a/verona.svg	Stadio Marcantonio Bentegodi	1903	\N	\N	2025-10-12 09:33:40.587	2025-10-24 22:14:33.751	Hellas Verona FC
67	Inter Milan	Inter	INT	/logos/serie-a/inter.svg	Stadio Giuseppe Meazza	1908	\N	\N	2025-10-12 09:33:40.588	2025-10-24 22:14:33.752	FC Internazionale Milano
68	Juventus FC	Juventus	JUV	/logos/serie-a/juventus.svg	Allianz Stadium	1897	\N	\N	2025-10-12 09:33:40.589	2025-10-24 22:14:33.752	Juventus FC
69	SS Lazio	Lazio	LAZ	/logos/serie-a/lazio.svg	Stadio Olimpico	1900	\N	\N	2025-10-12 09:33:40.59	2025-10-24 22:14:33.753	SS Lazio
70	US Lecce	Lecce	LEC	/logos/serie-a/lecce.svg	Stadio Via del Mare	1908	\N	\N	2025-10-12 09:33:40.59	2025-10-24 22:14:33.754	US Lecce
71	AC Milan	Milan	MIL	/logos/serie-a/milan.svg	San Siro	1899	\N	\N	2025-10-12 09:33:40.591	2025-10-24 22:14:33.754	AC Milan
72	SSC Napoli	Napoli	NAP	/logos/serie-a/napoli.svg	Stadio Diego Armando Maradona	1926	\N	\N	2025-10-12 09:33:40.592	2025-10-24 22:14:33.755	SSC Napoli
73	Parma Calcio	Parma	PAR	/logos/serie-a/parma.svg	Stadio Ennio Tardini	1913	\N	\N	2025-10-12 09:33:40.592	2025-10-24 22:14:33.756	Parma Calcio 1913
75	AS Roma	Roma	ROM	/logos/serie-a/roma.svg	Stadio Olimpico	1927	\N	\N	2025-10-12 09:33:40.594	2025-10-24 22:14:33.757	AS Roma
77	Torino FC	Torino	TOR	/logos/serie-a/torino.svg	Stadio Olimpico Grande Torino	1906	\N	\N	2025-10-12 09:33:40.595	2025-10-24 22:14:33.758	Torino FC
78	Udinese Calcio	Udinese	UDI	/logos/serie-a/udinese.svg	Bluenergy Stadium	1896	\N	\N	2025-10-12 09:33:40.596	2025-10-24 22:14:33.759	Udinese Calcio
76	US Sassuolo	Sassuolo	SAS	/logos/serie-a/sassuolo.svg	Mapei Stadium	1920	\N	\N	2025-10-12 09:33:40.594	2025-10-24 22:16:22.584	US Sassuolo Calcio
74	Pisa SC	Pisa	PIS	/logos/serie-a/pisa.svg	Cetilar Arena	1909	\N	\N	2025-10-12 09:33:40.593	2025-10-24 22:16:22.59	AC Pisa 1909
58	Wolfsburg	Wolfsburg	WOB	/logos/bundesliga/wolfsburg.svg	Volkswagen Arena	1945	\N	#65B32E	2025-10-06 18:06:56.304	2025-10-24 22:10:55.501	VfL Wolfsburg
52	RB Leipzig	RB Leipzig	RBL	/logos/bundesliga/leipzig.svg	Red Bull Arena	2009	\N	#DD0741	2025-10-06 18:06:56.303	2025-10-24 22:10:55.502	RB Leipzig
56	Werder Bremen	Werder Bremen	SVW	/logos/bundesliga/bremen.svg	Weserstadion	1899	\N	#1D9053	2025-10-06 18:06:56.304	2025-10-24 22:10:55.505	SV Werder Bremen
57	1. FC Köln	1. FC Köln	KOE	/logos/bundesliga/koln.svg	RheinEnergieStadion	1948	\N	#ED1C24	2025-10-06 18:06:56.303	2025-10-24 22:10:55.506	1. FC Köln
\.


--
-- Data for Name: TeamGameWeekStats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeamGameWeekStats" (id, "gameWeekId", "teamId", "matchesPlayed", won, drawn, lost, "goalsFor", "goalsAgainst", "goalDifference", points, result, "createdAt", "updatedAt") FROM stdin;
2774	84	52	1	1	0	0	6	0	6	3	W	2025-10-27 20:53:49.763	2025-10-27 20:53:49.763
2775	84	48	1	1	0	0	3	1	2	3	W	2025-10-27 20:53:49.764	2025-10-27 20:53:49.764
2776	84	47	1	0	0	1	1	3	-2	0	L	2025-10-27 20:53:49.765	2025-10-27 20:53:49.765
2777	84	45	1	0	0	1	0	1	-1	0	L	2025-10-27 20:53:49.766	2025-10-27 20:53:49.766
2778	84	58	1	1	0	0	1	0	1	3	W	2025-10-27 20:53:49.768	2025-10-27 20:53:49.768
2779	84	51	1	1	0	0	1	0	1	3	W	2025-10-27 20:53:49.769	2025-10-27 20:53:49.769
2780	84	57	1	0	0	1	0	1	-1	0	L	2025-10-27 20:53:49.77	2025-10-27 20:53:49.77
2781	84	43	1	1	0	0	2	0	2	3	W	2025-10-27 20:53:49.771	2025-10-27 20:53:49.771
2782	84	50	1	0	0	1	0	2	-2	0	L	2025-10-27 20:53:49.772	2025-10-27 20:53:49.772
2783	84	55	1	1	0	0	2	1	1	3	W	2025-10-27 20:53:49.774	2025-10-27 20:53:49.774
2784	84	54	1	0	0	1	1	2	-1	0	L	2025-10-27 20:53:49.775	2025-10-27 20:53:49.775
2147	77	41	1	1	0	0	6	0	6	3	W	2025-10-11 13:45:27.402	2025-10-11 13:45:27.402
2148	77	52	1	0	0	1	0	6	-6	0	L	2025-10-11 13:45:27.404	2025-10-11 13:45:27.404
2149	77	44	1	1	0	0	4	1	3	3	W	2025-10-11 13:45:27.413	2025-10-11 13:45:27.413
2150	77	56	1	0	0	1	1	4	-3	0	L	2025-10-11 13:45:27.415	2025-10-11 13:45:27.415
2151	77	50	1	0	0	1	1	3	-2	0	L	2025-10-11 13:45:27.419	2025-10-11 13:45:27.419
2152	77	42	1	1	0	0	3	1	2	3	W	2025-10-11 13:45:27.42	2025-10-11 13:45:27.42
2153	77	47	1	0	0	1	1	3	-2	0	L	2025-10-11 13:45:27.424	2025-10-11 13:45:27.424
2154	77	58	1	1	0	0	3	1	2	3	W	2025-10-11 13:45:27.425	2025-10-11 13:45:27.425
2155	77	43	1	0	0	1	1	2	-1	0	L	2025-10-11 13:45:27.429	2025-10-11 13:45:27.429
2156	77	48	1	1	0	0	2	1	1	3	W	2025-10-11 13:45:27.43	2025-10-11 13:45:27.43
2157	77	53	1	1	0	0	2	1	1	3	W	2025-10-11 13:45:27.434	2025-10-11 13:45:27.434
2158	77	55	1	0	0	1	1	2	-1	0	L	2025-10-11 13:45:27.435	2025-10-11 13:45:27.435
2159	77	54	1	0	0	1	0	1	-1	0	L	2025-10-11 13:45:27.438	2025-10-11 13:45:27.438
2160	77	57	1	1	0	0	1	0	1	3	W	2025-10-11 13:45:27.439	2025-10-11 13:45:27.439
2161	77	46	1	0	1	0	0	0	0	1	D	2025-10-11 13:45:27.443	2025-10-11 13:45:27.443
2162	77	45	1	0	1	0	0	0	0	1	D	2025-10-11 13:45:27.444	2025-10-11 13:45:27.444
2163	1	15	1	1	0	0	4	2	2	3	W	2025-10-11 13:50:34.719	2025-10-11 13:50:34.719
2164	1	6	1	0	0	1	2	4	-2	0	L	2025-10-11 13:50:34.721	2025-10-11 13:50:34.721
2165	1	20	1	0	1	0	0	0	0	1	D	2025-10-11 13:50:34.725	2025-10-11 13:50:34.725
2166	1	16	1	0	1	0	0	0	0	1	D	2025-10-11 13:50:34.726	2025-10-11 13:50:34.726
2167	1	1	1	0	1	0	1	1	0	1	D	2025-10-11 13:50:34.731	2025-10-11 13:50:34.731
2168	1	9	1	0	1	0	1	1	0	1	D	2025-10-11 13:50:34.732	2025-10-11 13:50:34.732
2169	1	3	1	1	0	0	3	0	3	3	W	2025-10-11 13:50:34.736	2025-10-11 13:50:34.736
2170	1	2	1	0	0	1	0	3	-3	0	L	2025-10-11 13:50:34.737	2025-10-11 13:50:34.737
2171	1	4	1	1	0	0	3	0	3	3	W	2025-10-11 13:50:34.74	2025-10-11 13:50:34.74
2172	1	7	1	0	0	1	0	3	-3	0	L	2025-10-11 13:50:34.741	2025-10-11 13:50:34.741
2173	1	18	1	0	0	1	0	4	-4	0	L	2025-10-11 13:50:34.744	2025-10-11 13:50:34.744
2174	1	19	1	1	0	0	4	0	4	3	W	2025-10-11 13:50:34.745	2025-10-11 13:50:34.745
2175	1	10	1	0	1	0	0	0	0	1	D	2025-10-11 13:50:34.749	2025-10-11 13:50:34.749
2176	1	17	1	0	1	0	0	0	0	1	D	2025-10-11 13:50:34.75	2025-10-11 13:50:34.75
2177	1	14	1	1	0	0	3	1	2	3	W	2025-10-11 13:50:34.753	2025-10-11 13:50:34.753
2178	1	12	1	0	0	1	1	3	-2	0	L	2025-10-11 13:50:34.754	2025-10-11 13:50:34.754
2179	1	11	1	0	0	1	0	1	-1	0	L	2025-10-11 13:50:34.757	2025-10-11 13:50:34.757
2180	1	5	1	1	0	0	1	0	1	3	W	2025-10-11 13:50:34.758	2025-10-11 13:50:34.758
2181	1	13	1	1	0	0	1	0	1	3	W	2025-10-11 13:50:34.762	2025-10-11 13:50:34.762
2182	1	8	1	0	0	1	0	1	-1	0	L	2025-10-11 13:50:34.763	2025-10-11 13:50:34.763
2183	2	2	1	0	0	1	1	5	-4	0	L	2025-10-11 14:03:04.801	2025-10-11 14:03:04.801
2184	2	10	1	1	0	0	5	1	4	3	W	2025-10-11 14:03:04.804	2025-10-11 14:03:04.804
2185	2	19	1	0	0	1	0	2	-2	0	L	2025-10-11 14:03:04.812	2025-10-11 14:03:04.812
2186	2	4	1	1	0	0	2	0	2	3	W	2025-10-11 14:03:04.813	2025-10-11 14:03:04.813
2187	2	6	1	1	0	0	1	0	1	3	W	2025-10-11 14:03:04.817	2025-10-11 14:03:04.817
2188	2	18	1	0	0	1	0	1	-1	0	L	2025-10-11 14:03:04.818	2025-10-11 14:03:04.818
2189	2	12	1	1	0	0	1	0	1	3	W	2025-10-11 14:03:04.821	2025-10-11 14:03:04.821
2190	2	20	1	0	0	1	0	1	-1	0	L	2025-10-11 14:03:04.822	2025-10-11 14:03:04.822
2191	2	7	1	1	0	0	2	0	2	3	W	2025-10-11 14:03:04.827	2025-10-11 14:03:04.827
2192	2	3	1	0	0	1	0	2	-2	0	L	2025-10-11 14:03:04.828	2025-10-11 14:03:04.828
2193	2	5	1	1	0	0	5	0	5	3	W	2025-10-11 14:03:04.831	2025-10-11 14:03:04.831
2194	2	13	1	0	0	1	0	5	-5	0	L	2025-10-11 14:03:04.832	2025-10-11 14:03:04.832
2195	2	17	1	0	1	0	1	1	0	1	D	2025-10-11 14:03:04.835	2025-10-11 14:03:04.835
2196	2	14	1	0	1	0	1	1	0	1	D	2025-10-11 14:03:04.836	2025-10-11 14:03:04.836
2197	2	8	1	1	0	0	2	0	2	3	W	2025-10-11 14:03:04.84	2025-10-11 14:03:04.84
2198	2	1	1	0	0	1	0	2	-2	0	L	2025-10-11 14:03:04.841	2025-10-11 14:03:04.841
2199	2	9	1	0	1	0	1	1	0	1	D	2025-10-11 14:03:04.845	2025-10-11 14:03:04.845
2200	2	11	1	0	1	0	1	1	0	1	D	2025-10-11 14:03:04.846	2025-10-11 14:03:04.846
2201	2	16	1	0	0	1	2	3	-1	0	L	2025-10-11 14:03:04.849	2025-10-11 14:03:04.849
2202	2	15	1	1	0	0	3	2	1	3	W	2025-10-11 14:03:04.849	2025-10-11 14:03:04.849
2203	3	10	1	1	0	0	2	0	2	3	W	2025-10-11 14:03:53.153	2025-10-11 14:03:53.153
2204	3	9	1	0	0	1	0	2	-2	0	L	2025-10-11 14:03:53.154	2025-10-11 14:03:53.154
2205	3	11	1	1	0	0	3	2	1	3	W	2025-10-11 14:03:53.157	2025-10-11 14:03:53.157
2206	3	7	1	0	0	1	2	3	-1	0	L	2025-10-11 14:03:53.159	2025-10-11 14:03:53.159
2207	3	3	1	1	0	0	2	1	1	3	W	2025-10-11 14:03:53.162	2025-10-11 14:03:53.162
2208	3	12	1	0	0	1	1	2	-1	0	L	2025-10-11 14:03:53.164	2025-10-11 14:03:53.164
2209	3	4	1	0	0	1	0	1	-1	0	L	2025-10-11 14:03:53.168	2025-10-11 14:03:53.168
2210	3	6	1	1	0	0	1	0	1	3	W	2025-10-11 14:03:53.169	2025-10-11 14:03:53.169
2211	3	18	1	0	0	1	2	3	-1	0	L	2025-10-11 14:03:53.172	2025-10-11 14:03:53.172
2212	3	8	1	1	0	0	3	2	1	3	W	2025-10-11 14:03:53.173	2025-10-11 14:03:53.173
2213	3	13	1	0	1	0	0	0	0	1	D	2025-10-11 14:03:53.176	2025-10-11 14:03:53.176
2214	3	16	1	0	1	0	0	0	0	1	D	2025-10-11 14:03:53.177	2025-10-11 14:03:53.177
2215	3	1	1	1	0	0	2	1	1	3	W	2025-10-11 14:03:53.181	2025-10-11 14:03:53.181
2216	3	19	1	0	0	1	1	2	-1	0	L	2025-10-11 14:03:53.182	2025-10-11 14:03:53.182
2217	3	14	1	0	0	1	0	3	-3	0	L	2025-10-11 14:03:53.186	2025-10-11 14:03:53.186
2218	3	2	1	1	0	0	3	0	3	3	W	2025-10-11 14:03:53.186	2025-10-11 14:03:53.186
2219	3	15	1	1	0	0	1	0	1	3	W	2025-10-11 14:03:53.19	2025-10-11 14:03:53.19
2220	3	5	1	0	0	1	0	1	-1	0	L	2025-10-11 14:03:53.19	2025-10-11 14:03:53.19
2221	3	20	1	0	0	1	0	3	-3	0	L	2025-10-11 14:03:53.193	2025-10-11 14:03:53.193
2222	3	17	1	1	0	0	3	0	3	3	W	2025-10-11 14:03:53.196	2025-10-11 14:03:53.196
2223	4	5	1	1	0	0	3	0	3	3	W	2025-10-11 14:07:35.867	2025-10-11 14:07:35.867
2224	4	14	1	0	0	1	0	3	-3	0	L	2025-10-11 14:07:35.869	2025-10-11 14:07:35.869
2225	4	6	1	1	0	0	2	1	1	3	W	2025-10-11 14:07:35.873	2025-10-11 14:07:35.873
2226	4	1	1	0	0	1	1	2	-1	0	L	2025-10-11 14:07:35.875	2025-10-11 14:07:35.875
2227	4	17	1	0	1	0	0	0	0	1	D	2025-10-11 14:07:35.879	2025-10-11 14:07:35.879
2228	4	3	1	0	1	0	0	0	0	1	D	2025-10-11 14:07:35.881	2025-10-11 14:07:35.881
2229	4	8	1	0	1	0	0	0	0	1	D	2025-10-11 14:07:35.884	2025-10-11 14:07:35.884
2230	4	20	1	0	1	0	0	0	0	1	D	2025-10-11 14:07:35.885	2025-10-11 14:07:35.885
2231	4	9	1	1	0	0	1	0	1	3	W	2025-10-11 14:07:35.888	2025-10-11 14:07:35.888
2232	4	13	1	0	0	1	0	1	-1	0	L	2025-10-11 14:07:35.889	2025-10-11 14:07:35.889
2233	4	16	1	1	0	0	1	0	1	3	W	2025-10-11 14:07:35.892	2025-10-11 14:07:35.892
2234	4	18	1	0	0	1	0	1	-1	0	L	2025-10-11 14:07:35.893	2025-10-11 14:07:35.893
2235	4	2	1	0	0	1	0	3	-3	0	L	2025-10-11 14:07:35.897	2025-10-11 14:07:35.897
2236	4	4	1	1	0	0	3	0	3	3	W	2025-10-11 14:07:35.898	2025-10-11 14:07:35.898
2237	4	12	1	0	1	0	2	2	0	1	D	2025-10-11 14:07:35.901	2025-10-11 14:07:35.901
2238	4	10	1	0	1	0	2	2	0	1	D	2025-10-11 14:07:35.902	2025-10-11 14:07:35.902
2239	4	7	1	0	0	1	0	1	-1	0	L	2025-10-11 14:07:35.913	2025-10-11 14:07:35.913
2240	4	15	1	1	0	0	1	0	1	3	W	2025-10-11 14:07:35.914	2025-10-11 14:07:35.914
2241	4	19	1	1	0	0	3	0	3	3	W	2025-10-11 14:07:35.917	2025-10-11 14:07:35.917
2242	4	11	1	0	0	1	0	3	-3	0	L	2025-10-11 14:07:35.918	2025-10-11 14:07:35.918
2243	5	15	1	1	0	0	2	1	1	3	W	2025-10-11 14:08:06.86	2025-10-11 14:08:06.86
2244	5	8	1	0	0	1	1	2	-1	0	L	2025-10-11 14:08:06.861	2025-10-11 14:08:06.861
2245	5	1	1	0	1	0	2	2	0	1	D	2025-10-11 14:08:06.864	2025-10-11 14:08:06.864
2246	5	4	1	0	1	0	2	2	0	1	D	2025-10-11 14:08:06.866	2025-10-11 14:08:06.866
2247	5	7	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.87	2025-10-11 14:08:06.87
2248	5	14	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.872	2025-10-11 14:08:06.872
2249	5	2	1	0	0	1	1	2	-1	0	L	2025-10-11 14:08:06.875	2025-10-11 14:08:06.875
2250	5	17	1	1	0	0	2	1	1	3	W	2025-10-11 14:08:06.876	2025-10-11 14:08:06.876
2251	5	18	1	0	0	1	1	3	-2	0	L	2025-10-11 14:08:06.879	2025-10-11 14:08:06.879
2252	5	13	1	1	0	0	3	1	2	3	W	2025-10-11 14:08:06.88	2025-10-11 14:08:06.88
2253	5	11	1	1	0	0	2	1	1	3	W	2025-10-11 14:08:06.883	2025-10-11 14:08:06.883
2254	5	10	1	0	0	1	1	2	-1	0	L	2025-10-11 14:08:06.884	2025-10-11 14:08:06.884
2255	5	9	1	1	0	0	3	1	2	3	W	2025-10-11 14:08:06.888	2025-10-11 14:08:06.888
2256	5	12	1	0	0	1	1	3	-2	0	L	2025-10-11 14:08:06.889	2025-10-11 14:08:06.889
2257	5	6	1	0	1	0	0	0	0	1	D	2025-10-11 14:08:06.892	2025-10-11 14:08:06.892
2258	5	16	1	0	1	0	0	0	0	1	D	2025-10-11 14:08:06.893	2025-10-11 14:08:06.893
2259	5	3	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.896	2025-10-11 14:08:06.896
2260	5	20	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.897	2025-10-11 14:08:06.897
2261	5	5	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.9	2025-10-11 14:08:06.9
2262	5	19	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:06.901	2025-10-11 14:08:06.901
2263	6	12	1	1	0	0	3	1	2	3	W	2025-10-11 14:08:44.044	2025-10-11 14:08:44.044
2264	6	11	1	0	0	1	1	3	-2	0	L	2025-10-11 14:08:44.045	2025-10-11 14:08:44.045
2265	6	10	1	0	0	1	1	3	-2	0	L	2025-10-11 14:08:44.05	2025-10-11 14:08:44.05
2266	6	1	1	1	0	0	3	1	2	3	W	2025-10-11 14:08:44.051	2025-10-11 14:08:44.051
2267	6	17	1	1	0	0	2	1	1	3	W	2025-10-11 14:08:44.055	2025-10-11 14:08:44.055
2268	6	15	1	0	0	1	1	2	-1	0	L	2025-10-11 14:08:44.056	2025-10-11 14:08:44.056
2269	6	13	1	0	1	0	2	2	0	1	D	2025-10-11 14:08:44.059	2025-10-11 14:08:44.059
2270	6	6	1	0	1	0	2	2	0	1	D	2025-10-11 14:08:44.06	2025-10-11 14:08:44.06
2271	6	19	1	1	0	0	5	1	4	3	W	2025-10-11 14:08:44.063	2025-10-11 14:08:44.063
2272	6	7	1	0	0	1	1	5	-4	0	L	2025-10-11 14:08:44.064	2025-10-11 14:08:44.064
2273	6	14	1	0	0	1	0	1	-1	0	L	2025-10-11 14:08:44.067	2025-10-11 14:08:44.067
2274	6	3	1	1	0	0	1	0	1	3	W	2025-10-11 14:08:44.069	2025-10-11 14:08:44.069
2275	6	4	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:44.072	2025-10-11 14:08:44.072
2276	6	18	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:44.073	2025-10-11 14:08:44.073
2277	6	20	1	1	0	0	3	1	2	3	W	2025-10-11 14:08:44.076	2025-10-11 14:08:44.076
2278	6	9	1	0	0	1	1	3	-2	0	L	2025-10-11 14:08:44.076	2025-10-11 14:08:44.076
2279	6	16	1	0	0	1	1	2	-1	0	L	2025-10-11 14:08:44.079	2025-10-11 14:08:44.079
2280	6	5	1	1	0	0	2	1	1	3	W	2025-10-11 14:08:44.08	2025-10-11 14:08:44.08
2281	6	8	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:44.084	2025-10-11 14:08:44.084
2282	6	2	1	0	1	0	1	1	0	1	D	2025-10-11 14:08:44.085	2025-10-11 14:08:44.085
2283	7	6	1	1	0	0	3	1	2	3	W	2025-10-11 14:09:12.538	2025-10-11 14:09:12.538
2284	7	9	1	0	0	1	1	3	-2	0	L	2025-10-11 14:09:12.54	2025-10-11 14:09:12.54
2285	7	13	1	0	0	1	1	2	-1	0	L	2025-10-11 14:09:12.544	2025-10-11 14:09:12.544
2286	7	4	1	1	0	0	2	1	1	3	W	2025-10-11 14:09:12.545	2025-10-11 14:09:12.545
2287	7	5	1	1	0	0	2	0	2	3	W	2025-10-11 14:09:12.549	2025-10-11 14:09:12.549
2288	7	2	1	0	0	1	0	2	-2	0	L	2025-10-11 14:09:12.55	2025-10-11 14:09:12.55
2289	7	11	1	1	0	0	2	0	2	3	W	2025-10-11 14:09:12.553	2025-10-11 14:09:12.553
2290	7	3	1	0	0	1	0	2	-2	0	L	2025-10-11 14:09:12.554	2025-10-11 14:09:12.554
2291	7	10	1	1	0	0	2	1	1	3	W	2025-10-11 14:09:12.558	2025-10-11 14:09:12.558
2292	7	15	1	0	0	1	1	2	-1	0	L	2025-10-11 14:09:12.559	2025-10-11 14:09:12.559
2293	7	20	1	1	0	0	2	1	1	3	W	2025-10-11 14:09:12.562	2025-10-11 14:09:12.562
2294	7	7	1	0	0	1	1	2	-1	0	L	2025-10-11 14:09:12.563	2025-10-11 14:09:12.563
2295	7	8	1	1	0	0	2	1	1	3	W	2025-10-11 14:09:12.566	2025-10-11 14:09:12.566
2296	7	17	1	0	0	1	1	2	-1	0	L	2025-10-11 14:09:12.567	2025-10-11 14:09:12.567
2297	7	16	1	1	0	0	2	0	2	3	W	2025-10-11 14:09:12.57	2025-10-11 14:09:12.57
2298	7	14	1	0	0	1	0	2	-2	0	L	2025-10-11 14:09:12.571	2025-10-11 14:09:12.571
2299	7	18	1	0	1	0	1	1	0	1	D	2025-10-11 14:09:12.576	2025-10-11 14:09:12.576
2300	7	1	1	0	1	0	1	1	0	1	D	2025-10-11 14:09:12.577	2025-10-11 14:09:12.577
2301	7	12	1	0	0	1	0	1	-1	0	L	2025-10-11 14:09:12.58	2025-10-11 14:09:12.58
2302	7	19	1	1	0	0	1	0	1	3	W	2025-10-11 14:09:12.58	2025-10-11 14:09:12.58
2309	77	49	1	0	1	0	3	3	0	1	D	2025-10-11 15:10:46.336	2025-10-11 15:10:46.336
2310	77	51	1	0	1	0	3	3	0	1	D	2025-10-11 15:10:46.339	2025-10-11 15:10:46.339
2311	78	48	1	0	0	1	1	3	-2	0	L	2025-10-11 15:12:59.036	2025-10-11 15:12:59.036
2312	78	44	1	1	0	0	3	1	2	3	W	2025-10-11 15:12:59.038	2025-10-11 15:12:59.038
2313	78	52	1	1	0	0	2	0	2	3	W	2025-10-11 15:12:59.044	2025-10-11 15:12:59.044
2314	78	47	1	0	0	1	0	2	-2	0	L	2025-10-11 15:12:59.046	2025-10-11 15:12:59.046
2315	78	55	1	1	0	0	1	0	1	3	W	2025-10-11 15:12:59.05	2025-10-11 15:12:59.05
2316	78	46	1	0	0	1	0	1	-1	0	L	2025-10-11 15:12:59.051	2025-10-11 15:12:59.051
2317	78	56	1	0	1	0	3	3	0	1	D	2025-10-11 15:12:59.056	2025-10-11 15:12:59.056
2318	78	43	1	0	1	0	3	3	0	1	D	2025-10-11 15:12:59.058	2025-10-11 15:12:59.058
2319	78	42	1	0	0	1	2	3	-1	0	L	2025-10-11 15:12:59.061	2025-10-11 15:12:59.061
2320	78	41	1	1	0	0	3	2	1	3	W	2025-10-11 15:12:59.062	2025-10-11 15:12:59.062
2321	78	58	1	0	1	0	1	1	0	1	D	2025-10-11 15:12:59.065	2025-10-11 15:12:59.065
2322	78	54	1	0	1	0	1	1	0	1	D	2025-10-11 15:12:59.066	2025-10-11 15:12:59.066
2323	78	51	1	1	0	0	3	0	3	3	W	2025-10-11 15:12:59.07	2025-10-11 15:12:59.07
2324	78	53	1	0	0	1	0	3	-3	0	L	2025-10-11 15:12:59.071	2025-10-11 15:12:59.071
2325	78	57	1	1	0	0	4	1	3	3	W	2025-10-11 15:12:59.076	2025-10-11 15:12:59.076
2326	78	50	1	0	0	1	1	4	-3	0	L	2025-10-11 15:12:59.077	2025-10-11 15:12:59.077
2327	78	45	1	0	0	1	0	2	-2	0	L	2025-10-11 15:12:59.081	2025-10-11 15:12:59.081
2328	78	49	1	1	0	0	2	0	2	3	W	2025-10-11 15:12:59.083	2025-10-11 15:12:59.083
2329	79	43	1	1	0	0	3	1	2	3	W	2025-10-11 15:14:56.332	2025-10-11 15:14:56.332
2330	79	44	1	0	0	1	1	3	-2	0	L	2025-10-11 15:14:56.334	2025-10-11 15:14:56.334
2331	79	50	1	1	0	0	3	1	2	3	W	2025-10-11 15:14:56.339	2025-10-11 15:14:56.339
2332	79	55	1	0	0	1	1	3	-2	0	L	2025-10-11 15:14:56.342	2025-10-11 15:14:56.342
2333	79	47	1	0	0	1	0	2	-2	0	L	2025-10-11 15:14:56.347	2025-10-11 15:14:56.347
2334	79	51	1	1	0	0	2	0	2	3	W	2025-10-11 15:14:56.349	2025-10-11 15:14:56.349
2335	79	54	1	0	0	1	0	1	-1	0	L	2025-10-11 15:14:56.355	2025-10-11 15:14:56.355
2336	79	52	1	1	0	0	1	0	1	3	W	2025-10-11 15:14:56.356	2025-10-11 15:14:56.356
2337	79	53	1	0	0	1	2	4	-2	0	L	2025-10-11 15:14:56.359	2025-10-11 15:14:56.359
2338	79	48	1	1	0	0	4	2	2	3	W	2025-10-11 15:14:56.36	2025-10-11 15:14:56.36
2339	79	58	1	0	1	0	3	3	0	1	D	2025-10-11 15:14:56.364	2025-10-11 15:14:56.364
2340	79	57	1	0	1	0	3	3	0	1	D	2025-10-11 15:14:56.365	2025-10-11 15:14:56.365
2341	79	41	1	1	0	0	5	0	5	3	W	2025-10-11 15:14:56.37	2025-10-11 15:14:56.37
2342	79	45	1	0	0	1	0	5	-5	0	L	2025-10-11 15:14:56.371	2025-10-11 15:14:56.371
2343	79	46	1	0	0	1	0	4	-4	0	L	2025-10-11 15:14:56.374	2025-10-11 15:14:56.374
2344	79	56	1	1	0	0	4	0	4	3	W	2025-10-11 15:14:56.375	2025-10-11 15:14:56.375
2345	79	49	1	1	0	0	2	1	1	3	W	2025-10-11 15:14:56.378	2025-10-11 15:14:56.378
2346	79	42	1	0	0	1	1	2	-1	0	L	2025-10-11 15:14:56.379	2025-10-11 15:14:56.379
2347	80	42	1	0	0	1	1	4	-3	0	L	2025-10-11 15:16:37.58	2025-10-11 15:16:37.58
2348	80	54	1	1	0	0	4	1	3	3	W	2025-10-11 15:16:37.582	2025-10-11 15:16:37.582
2349	80	45	1	1	0	0	2	1	1	3	W	2025-10-11 15:16:37.587	2025-10-11 15:16:37.587
2350	80	47	1	0	0	1	1	2	-1	0	L	2025-10-11 15:16:37.588	2025-10-11 15:16:37.588
2351	80	48	1	0	0	1	1	4	-3	0	L	2025-10-11 15:16:37.591	2025-10-11 15:16:37.591
2352	80	41	1	1	0	0	4	1	3	3	W	2025-10-11 15:16:37.593	2025-10-11 15:16:37.593
2353	80	56	1	0	0	1	0	3	-3	0	L	2025-10-11 15:16:37.596	2025-10-11 15:16:37.596
2354	80	50	1	1	0	0	3	0	3	3	W	2025-10-11 15:16:37.597	2025-10-11 15:16:37.597
2355	80	52	1	1	0	0	3	1	2	3	W	2025-10-11 15:16:37.602	2025-10-11 15:16:37.602
2356	80	57	1	0	0	1	1	3	-2	0	L	2025-10-11 15:16:37.603	2025-10-11 15:16:37.603
2357	80	44	1	0	0	1	3	4	-1	0	L	2025-10-11 15:16:37.606	2025-10-11 15:16:37.606
2358	80	53	1	1	0	0	4	3	1	3	W	2025-10-11 15:16:37.608	2025-10-11 15:16:37.608
2359	80	43	1	0	1	0	1	1	0	1	D	2025-10-11 15:16:37.612	2025-10-11 15:16:37.612
2360	80	46	1	0	1	0	1	1	0	1	D	2025-10-11 15:16:37.613	2025-10-11 15:16:37.613
2361	80	51	1	1	0	0	1	0	1	3	W	2025-10-11 15:16:37.616	2025-10-11 15:16:37.616
2362	80	58	1	0	0	1	0	1	-1	0	L	2025-10-11 15:16:37.617	2025-10-11 15:16:37.617
2363	80	55	1	1	0	0	2	0	2	3	W	2025-10-11 15:16:37.621	2025-10-11 15:16:37.621
2364	80	49	1	0	0	1	0	2	-2	0	L	2025-10-11 15:16:37.622	2025-10-11 15:16:37.622
2365	81	41	1	1	0	0	4	0	4	3	W	2025-10-11 15:17:54.751	2025-10-11 15:17:54.751
2366	81	56	1	0	0	1	0	4	-4	0	L	2025-10-11 15:17:54.752	2025-10-11 15:17:54.752
2367	81	47	1	1	0	0	2	1	1	3	W	2025-10-11 15:17:54.756	2025-10-11 15:17:54.756
2368	81	42	1	0	0	1	1	2	-1	0	L	2025-10-11 15:17:54.757	2025-10-11 15:17:54.757
2369	81	54	1	0	0	1	0	2	-2	0	L	2025-10-11 15:17:54.761	2025-10-11 15:17:54.761
2370	81	51	1	1	0	0	2	0	2	3	W	2025-10-11 15:17:54.763	2025-10-11 15:17:54.763
2371	81	58	1	0	0	1	0	1	-1	0	L	2025-10-11 15:17:54.766	2025-10-11 15:17:54.766
2372	81	52	1	1	0	0	1	0	1	3	W	2025-10-11 15:17:54.768	2025-10-11 15:17:54.768
2373	81	46	1	0	0	1	4	6	-2	0	L	2025-10-11 15:17:54.771	2025-10-11 15:17:54.771
2374	81	44	1	1	0	0	6	4	2	3	W	2025-10-11 15:17:54.772	2025-10-11 15:17:54.772
2375	81	50	1	0	1	0	1	1	0	1	D	2025-10-11 15:17:54.775	2025-10-11 15:17:54.775
2376	81	48	1	0	1	0	1	1	0	1	D	2025-10-11 15:17:54.776	2025-10-11 15:17:54.776
2377	81	57	1	0	0	1	1	2	-1	0	L	2025-10-11 15:17:54.78	2025-10-11 15:17:54.78
2378	81	55	1	1	0	0	2	1	1	3	W	2025-10-11 15:17:54.781	2025-10-11 15:17:54.781
2379	81	53	1	0	1	0	0	0	0	1	D	2025-10-11 15:17:54.784	2025-10-11 15:17:54.784
2380	81	45	1	0	1	0	0	0	0	1	D	2025-10-11 15:17:54.785	2025-10-11 15:17:54.785
2381	81	49	1	0	0	1	1	2	-1	0	L	2025-10-11 15:17:54.788	2025-10-11 15:17:54.788
2382	81	43	1	1	0	0	2	1	1	3	W	2025-10-11 15:17:54.789	2025-10-11 15:17:54.789
2383	82	48	1	0	0	1	0	1	-1	0	L	2025-10-11 15:19:38.018	2025-10-11 15:19:38.018
2384	82	57	1	1	0	0	1	0	1	3	W	2025-10-11 15:19:38.019	2025-10-11 15:19:38.019
2385	82	42	1	1	0	0	3	1	2	3	W	2025-10-11 15:19:38.022	2025-10-11 15:19:38.022
2386	82	58	1	0	0	1	1	3	-2	0	L	2025-10-11 15:19:38.024	2025-10-11 15:19:38.024
2387	82	51	1	0	1	0	1	1	0	1	D	2025-10-11 15:19:38.028	2025-10-11 15:19:38.028
2388	82	52	1	0	1	0	1	1	0	1	D	2025-10-11 15:19:38.029	2025-10-11 15:19:38.029
2389	82	43	1	1	0	0	2	0	2	3	W	2025-10-11 15:19:38.034	2025-10-11 15:19:38.034
2390	82	53	1	0	0	1	0	2	-2	0	L	2025-10-11 15:19:38.035	2025-10-11 15:19:38.035
2391	82	44	1	0	0	1	0	3	-3	0	L	2025-10-11 15:19:38.038	2025-10-11 15:19:38.038
2392	82	41	1	1	0	0	3	0	3	3	W	2025-10-11 15:19:38.039	2025-10-11 15:19:38.039
2393	82	55	1	1	0	0	1	0	1	3	W	2025-10-11 15:19:38.042	2025-10-11 15:19:38.042
2394	82	47	1	0	0	1	0	1	-1	0	L	2025-10-11 15:19:38.043	2025-10-11 15:19:38.043
2395	82	45	1	1	0	0	4	0	4	3	W	2025-10-11 15:19:38.046	2025-10-11 15:19:38.046
2396	82	54	1	0	0	1	0	4	-4	0	L	2025-10-11 15:19:38.048	2025-10-11 15:19:38.048
2397	82	46	1	0	1	0	0	0	0	1	D	2025-10-11 15:19:38.051	2025-10-11 15:19:38.051
2398	82	50	1	0	1	0	0	0	0	1	D	2025-10-11 15:19:38.053	2025-10-11 15:19:38.053
2399	82	56	1	1	0	0	1	0	1	3	W	2025-10-11 15:19:38.056	2025-10-11 15:19:38.056
2400	82	49	1	0	0	1	0	1	-1	0	L	2025-10-11 15:19:38.057	2025-10-11 15:19:38.057
2401	39	23	1	0	0	1	1	3	-2	0	L	2025-10-11 15:49:13.576	2025-10-11 15:49:13.576
2402	39	34	1	1	0	0	3	1	2	3	W	2025-10-11 15:49:13.579	2025-10-11 15:49:13.579
2403	39	39	1	1	0	0	2	0	2	3	W	2025-10-11 15:49:13.583	2025-10-11 15:49:13.583
2404	39	22	1	0	0	1	0	2	-2	0	L	2025-10-11 15:49:13.584	2025-10-11 15:49:13.584
2405	39	30	1	0	0	1	0	3	-3	0	L	2025-10-11 15:49:13.587	2025-10-11 15:49:13.587
2406	39	37	1	1	0	0	3	0	3	3	W	2025-10-11 15:49:13.589	2025-10-11 15:49:13.589
2407	39	40	1	0	1	0	1	1	0	1	D	2025-10-11 15:49:13.593	2025-10-11 15:49:13.593
2408	39	38	1	0	1	0	1	1	0	1	D	2025-10-11 15:49:13.594	2025-10-11 15:49:13.594
2409	39	33	1	0	0	1	0	2	-2	0	L	2025-10-11 15:49:13.598	2025-10-11 15:49:13.598
2410	39	25	1	1	0	0	2	0	2	3	W	2025-10-11 15:49:13.599	2025-10-11 15:49:13.599
2411	39	32	1	0	1	0	1	1	0	1	D	2025-10-11 15:49:13.602	2025-10-11 15:49:13.602
2412	39	24	1	0	1	0	1	1	0	1	D	2025-10-11 15:49:13.603	2025-10-11 15:49:13.603
2413	39	29	1	1	0	0	1	0	1	3	W	2025-10-11 15:49:13.606	2025-10-11 15:49:13.606
2414	39	27	1	0	0	1	0	1	-1	0	L	2025-10-11 15:49:13.608	2025-10-11 15:49:13.608
2415	39	31	1	1	0	0	2	1	1	3	W	2025-10-11 15:49:13.612	2025-10-11 15:49:13.612
2416	39	21	1	0	0	1	1	2	-1	0	L	2025-10-11 15:49:13.613	2025-10-11 15:49:13.613
2417	39	36	1	1	0	0	2	1	1	3	W	2025-10-11 15:49:13.616	2025-10-11 15:49:13.616
2418	39	26	1	0	0	1	1	2	-1	0	L	2025-10-11 15:49:13.617	2025-10-11 15:49:13.617
2419	39	28	1	1	0	0	3	2	1	3	W	2025-10-11 15:49:13.621	2025-10-11 15:49:13.621
2420	39	35	1	0	0	1	2	3	-1	0	L	2025-10-11 15:49:13.622	2025-10-11 15:49:13.622
2421	40	30	1	0	1	0	1	1	0	1	D	2025-10-11 15:54:25.972	2025-10-11 15:54:25.972
2422	40	33	1	0	1	0	1	1	0	1	D	2025-10-11 15:54:25.974	2025-10-11 15:54:25.974
2423	40	21	1	0	0	1	2	3	-1	0	L	2025-10-11 15:54:25.98	2025-10-11 15:54:25.98
2424	40	37	1	1	0	0	3	2	1	3	W	2025-10-11 15:54:25.981	2025-10-11 15:54:25.981
2425	40	27	1	1	0	0	1	0	1	3	W	2025-10-11 15:54:25.985	2025-10-11 15:54:25.985
2426	40	40	1	0	0	1	0	1	-1	0	L	2025-10-11 15:54:25.986	2025-10-11 15:54:25.986
2427	40	39	1	1	0	0	5	0	5	3	W	2025-10-11 15:54:25.989	2025-10-11 15:54:25.989
2428	40	23	1	0	0	1	0	5	-5	0	L	2025-10-11 15:54:25.99	2025-10-11 15:54:25.99
2429	40	22	1	0	0	1	0	3	-3	0	L	2025-10-11 15:54:25.993	2025-10-11 15:54:25.993
2430	40	29	1	1	0	0	3	0	3	3	W	2025-10-11 15:54:25.994	2025-10-11 15:54:25.994
2431	40	35	1	0	0	1	1	2	-1	0	L	2025-10-11 15:54:25.999	2025-10-11 15:54:25.999
2432	40	25	1	1	0	0	2	1	1	3	W	2025-10-11 15:54:26	2025-10-11 15:54:26
2433	40	24	1	1	0	0	1	0	1	3	W	2025-10-11 15:54:26.004	2025-10-11 15:54:26.004
2434	40	31	1	0	0	1	0	1	-1	0	L	2025-10-11 15:54:26.005	2025-10-11 15:54:26.005
2435	40	26	1	0	1	0	1	1	0	1	D	2025-10-11 15:54:26.008	2025-10-11 15:54:26.008
2436	40	32	1	0	1	0	1	1	0	1	D	2025-10-11 15:54:26.009	2025-10-11 15:54:26.009
2437	40	38	1	0	1	0	2	2	0	1	D	2025-10-11 15:54:26.013	2025-10-11 15:54:26.013
2438	40	36	1	0	1	0	2	2	0	1	D	2025-10-11 15:54:26.014	2025-10-11 15:54:26.014
2439	40	28	1	1	0	0	1	0	1	3	W	2025-10-11 15:54:26.017	2025-10-11 15:54:26.017
2440	40	34	1	0	0	1	0	1	-1	0	L	2025-10-11 15:54:26.018	2025-10-11 15:54:26.018
2441	41	32	1	1	0	0	2	0	2	3	W	2025-10-11 16:03:49.757	2025-10-11 16:03:49.757
2442	41	21	1	0	0	1	0	2	-2	0	L	2025-10-11 16:03:49.76	2025-10-11 16:03:49.76
2443	41	40	1	1	0	0	3	0	3	3	W	2025-10-11 16:03:49.763	2025-10-11 16:03:49.763
2444	41	25	1	0	0	1	0	3	-3	0	L	2025-10-11 16:03:49.765	2025-10-11 16:03:49.765
2445	41	22	1	1	0	0	1	0	1	3	W	2025-10-11 16:03:49.768	2025-10-11 16:03:49.768
2446	41	38	1	0	0	1	0	1	-1	0	L	2025-10-11 16:03:49.769	2025-10-11 16:03:49.769
2447	41	23	1	0	0	1	0	2	-2	0	L	2025-10-11 16:03:49.775	2025-10-11 16:03:49.775
2448	41	35	1	1	0	0	2	0	2	3	W	2025-10-11 16:03:49.776	2025-10-11 16:03:49.776
2449	41	29	1	1	0	0	2	1	1	3	W	2025-10-11 16:03:49.779	2025-10-11 16:03:49.779
2450	41	30	1	0	0	1	1	2	-1	0	L	2025-10-11 16:03:49.78	2025-10-11 16:03:49.78
2451	41	34	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.784	2025-10-11 16:03:49.784
2452	41	37	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.785	2025-10-11 16:03:49.785
2453	41	31	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.789	2025-10-11 16:03:49.789
2454	41	26	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.79	2025-10-11 16:03:49.79
2455	41	33	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.794	2025-10-11 16:03:49.794
2456	41	39	1	0	1	0	1	1	0	1	D	2025-10-11 16:03:49.795	2025-10-11 16:03:49.795
2457	41	24	1	0	0	1	1	2	-1	0	L	2025-10-11 16:03:49.799	2025-10-11 16:03:49.799
2458	41	28	1	1	0	0	2	1	1	3	W	2025-10-11 16:03:49.8	2025-10-11 16:03:49.8
2459	41	36	1	1	0	0	1	0	1	3	W	2025-10-11 16:03:49.803	2025-10-11 16:03:49.803
2460	41	27	1	0	0	1	0	1	-1	0	L	2025-10-11 16:03:49.804	2025-10-11 16:03:49.804
2461	42	35	1	0	1	0	2	2	0	1	D	2025-10-11 16:08:44.664	2025-10-11 16:08:44.664
2462	42	32	1	0	1	0	2	2	0	1	D	2025-10-11 16:08:44.665	2025-10-11 16:08:44.665
2463	42	25	1	1	0	0	2	0	2	3	W	2025-10-11 16:08:44.669	2025-10-11 16:08:44.669
2464	42	22	1	0	0	1	0	2	-2	0	L	2025-10-11 16:08:44.67	2025-10-11 16:08:44.67
2465	42	38	1	0	0	1	1	2	-1	0	L	2025-10-11 16:08:44.674	2025-10-11 16:08:44.674
2466	42	29	1	1	0	0	2	1	1	3	W	2025-10-11 16:08:44.676	2025-10-11 16:08:44.676
2467	42	21	1	0	1	0	2	2	0	1	D	2025-10-11 16:08:44.681	2025-10-11 16:08:44.681
2468	42	24	1	0	1	0	2	2	0	1	D	2025-10-11 16:08:44.682	2025-10-11 16:08:44.682
2469	42	27	1	1	0	0	2	0	2	3	W	2025-10-11 16:08:44.685	2025-10-11 16:08:44.685
2470	42	34	1	0	0	1	0	2	-2	0	L	2025-10-11 16:08:44.686	2025-10-11 16:08:44.686
2471	42	37	1	1	0	0	6	0	6	3	W	2025-10-11 16:08:44.69	2025-10-11 16:08:44.69
2472	42	40	1	0	0	1	0	6	-6	0	L	2025-10-11 16:08:44.691	2025-10-11 16:08:44.691
2473	42	28	1	0	0	1	0	1	-1	0	L	2025-10-11 16:08:44.694	2025-10-11 16:08:44.694
2474	42	31	1	1	0	0	1	0	1	3	W	2025-10-11 16:08:44.696	2025-10-11 16:08:44.696
2475	42	26	1	1	0	0	2	0	2	3	W	2025-10-11 16:08:44.7	2025-10-11 16:08:44.7
2476	42	39	1	0	0	1	0	2	-2	0	L	2025-10-11 16:08:44.701	2025-10-11 16:08:44.701
2477	42	33	1	0	1	0	1	1	0	1	D	2025-10-11 16:08:44.704	2025-10-11 16:08:44.704
2478	42	23	1	0	1	0	1	1	0	1	D	2025-10-11 16:08:44.705	2025-10-11 16:08:44.705
2479	42	36	1	1	0	0	3	2	1	3	W	2025-10-11 16:08:44.708	2025-10-11 16:08:44.708
2480	42	30	1	0	0	1	2	3	-1	0	L	2025-10-11 16:08:44.71	2025-10-11 16:08:44.71
2481	43	24	1	1	0	0	3	1	2	3	W	2025-10-11 16:15:39.42	2025-10-11 16:15:39.42
2482	43	38	1	0	0	1	1	3	-2	0	L	2025-10-11 16:15:39.423	2025-10-11 16:15:39.423
2483	43	39	1	1	0	0	2	1	1	3	W	2025-10-11 16:15:39.427	2025-10-11 16:15:39.427
2484	43	27	1	0	0	1	1	2	-1	0	L	2025-10-11 16:15:39.428	2025-10-11 16:15:39.428
2485	43	32	1	1	0	0	1	0	1	3	W	2025-10-11 16:15:39.432	2025-10-11 16:15:39.432
2486	43	22	1	0	0	1	0	1	-1	0	L	2025-10-11 16:15:39.434	2025-10-11 16:15:39.434
2487	43	37	1	1	0	0	3	0	3	3	W	2025-10-11 16:15:39.438	2025-10-11 16:15:39.438
2488	43	25	1	0	0	1	0	3	-3	0	L	2025-10-11 16:15:39.439	2025-10-11 16:15:39.439
2489	43	23	1	0	0	1	0	4	-4	0	L	2025-10-11 16:15:39.442	2025-10-11 16:15:39.442
2490	43	21	1	1	0	0	4	0	4	3	W	2025-10-11 16:15:39.443	2025-10-11 16:15:39.443
2491	43	29	1	1	0	0	2	0	2	3	W	2025-10-11 16:15:39.447	2025-10-11 16:15:39.447
2492	43	36	1	0	0	1	0	2	-2	0	L	2025-10-11 16:15:39.448	2025-10-11 16:15:39.448
2493	43	31	1	0	0	1	1	2	-1	0	L	2025-10-11 16:15:39.453	2025-10-11 16:15:39.453
2494	43	35	1	1	0	0	2	1	1	3	W	2025-10-11 16:15:39.454	2025-10-11 16:15:39.454
2495	43	40	1	1	0	0	2	0	2	3	W	2025-10-11 16:15:39.458	2025-10-11 16:15:39.458
2496	43	28	1	0	0	1	0	2	-2	0	L	2025-10-11 16:15:39.459	2025-10-11 16:15:39.459
2497	43	34	1	0	1	0	1	1	0	1	D	2025-10-11 16:15:39.463	2025-10-11 16:15:39.463
2498	43	33	1	0	1	0	1	1	0	1	D	2025-10-11 16:15:39.465	2025-10-11 16:15:39.465
2499	43	30	1	0	1	0	1	1	0	1	D	2025-10-11 16:15:39.471	2025-10-11 16:15:39.471
2500	43	26	1	0	1	0	1	1	0	1	D	2025-10-11 16:15:39.472	2025-10-11 16:15:39.472
2501	44	35	1	0	0	1	1	2	-1	0	L	2025-10-11 16:21:23.65	2025-10-11 16:21:23.65
2502	44	39	1	1	0	0	2	1	1	3	W	2025-10-11 16:21:23.655	2025-10-11 16:21:23.655
2503	44	38	1	1	0	0	1	0	1	3	W	2025-10-11 16:21:23.659	2025-10-11 16:21:23.659
2504	44	30	1	0	0	1	0	1	-1	0	L	2025-10-11 16:21:23.66	2025-10-11 16:21:23.66
2505	44	27	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.665	2025-10-11 16:21:23.665
2506	44	32	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.666	2025-10-11 16:21:23.666
2507	44	22	1	0	0	1	1	3	-2	0	L	2025-10-11 16:21:23.67	2025-10-11 16:21:23.67
2508	44	37	1	1	0	0	3	1	2	3	W	2025-10-11 16:21:23.671	2025-10-11 16:21:23.671
2509	44	33	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.674	2025-10-11 16:21:23.674
2510	44	24	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.676	2025-10-11 16:21:23.676
2511	44	36	1	0	1	0	2	2	0	1	D	2025-10-11 16:21:23.68	2025-10-11 16:21:23.68
2512	44	40	1	0	1	0	2	2	0	1	D	2025-10-11 16:21:23.681	2025-10-11 16:21:23.681
2513	44	28	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.685	2025-10-11 16:21:23.685
2514	44	23	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.686	2025-10-11 16:21:23.686
2515	44	21	1	0	0	1	1	4	-3	0	L	2025-10-11 16:21:23.69	2025-10-11 16:21:23.69
2516	44	29	1	1	0	0	4	1	3	3	W	2025-10-11 16:21:23.691	2025-10-11 16:21:23.691
2517	44	25	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.694	2025-10-11 16:21:23.694
2518	44	31	1	0	1	0	1	1	0	1	D	2025-10-11 16:21:23.695	2025-10-11 16:21:23.695
2519	44	26	1	1	0	0	3	2	1	3	W	2025-10-11 16:21:23.699	2025-10-11 16:21:23.699
2520	44	34	1	0	0	1	2	3	-1	0	L	2025-10-11 16:21:23.701	2025-10-11 16:21:23.701
2521	45	34	1	0	0	1	0	1	-1	0	L	2025-10-11 16:24:56.125	2025-10-11 16:24:56.125
2522	45	35	1	1	0	0	1	0	1	3	W	2025-10-11 16:24:56.126	2025-10-11 16:24:56.126
2523	45	32	1	1	0	0	2	1	1	3	W	2025-10-11 16:24:56.129	2025-10-11 16:24:56.129
2524	45	33	1	0	0	1	1	2	-1	0	L	2025-10-11 16:24:56.13	2025-10-11 16:24:56.13
2525	45	24	1	1	0	0	2	0	2	3	W	2025-10-11 16:24:56.135	2025-10-11 16:24:56.135
2526	45	27	1	0	0	1	0	2	-2	0	L	2025-10-11 16:24:56.138	2025-10-11 16:24:56.138
2527	45	40	1	0	0	1	1	2	-1	0	L	2025-10-11 16:24:56.149	2025-10-11 16:24:56.149
2528	45	22	1	1	0	0	2	1	1	3	W	2025-10-11 16:24:56.151	2025-10-11 16:24:56.151
2529	45	37	1	1	0	0	2	1	1	3	W	2025-10-11 16:24:56.155	2025-10-11 16:24:56.155
2530	45	38	1	0	0	1	1	2	-1	0	L	2025-10-11 16:24:56.156	2025-10-11 16:24:56.156
2531	45	23	1	0	1	0	0	0	0	1	D	2025-10-11 16:24:56.159	2025-10-11 16:24:56.159
2532	45	36	1	0	1	0	0	0	0	1	D	2025-10-11 16:24:56.16	2025-10-11 16:24:56.16
2533	45	25	1	0	1	0	1	1	0	1	D	2025-10-11 16:24:56.164	2025-10-11 16:24:56.164
2534	45	21	1	0	1	0	1	1	0	1	D	2025-10-11 16:24:56.165	2025-10-11 16:24:56.165
2535	45	26	1	1	0	0	5	2	3	3	W	2025-10-11 16:24:56.168	2025-10-11 16:24:56.168
2536	45	29	1	0	0	1	2	5	-3	0	L	2025-10-11 16:24:56.17	2025-10-11 16:24:56.17
2537	45	30	1	1	0	0	1	0	1	3	W	2025-10-11 16:24:56.174	2025-10-11 16:24:56.174
2538	45	31	1	0	0	1	0	1	-1	0	L	2025-10-11 16:24:56.175	2025-10-11 16:24:56.175
2539	45	39	1	1	0	0	1	0	1	3	W	2025-10-11 16:24:56.179	2025-10-11 16:24:56.179
2540	45	28	1	0	0	1	0	1	-1	0	L	2025-10-11 16:24:56.18	2025-10-11 16:24:56.18
2541	46	23	1	1	0	0	2	1	1	3	W	2025-10-11 16:29:37.511	2025-10-11 16:29:37.511
2542	46	40	1	0	0	1	1	2	-1	0	L	2025-10-11 16:29:37.513	2025-10-11 16:29:37.513
2543	46	29	1	1	0	0	3	1	2	3	W	2025-10-11 16:29:37.518	2025-10-11 16:29:37.518
2544	46	39	1	0	0	1	1	3	-2	0	L	2025-10-11 16:29:37.519	2025-10-11 16:29:37.519
2545	46	35	1	1	0	0	4	1	3	3	W	2025-10-11 16:29:37.522	2025-10-11 16:29:37.522
2546	46	37	1	0	0	1	1	4	-3	0	L	2025-10-11 16:29:37.523	2025-10-11 16:29:37.523
2547	46	38	1	0	0	1	0	1	-1	0	L	2025-10-11 16:29:37.527	2025-10-11 16:29:37.527
2548	46	34	1	1	0	0	1	0	1	3	W	2025-10-11 16:29:37.527	2025-10-11 16:29:37.527
2549	46	27	1	1	0	0	2	1	1	3	W	2025-10-11 16:29:37.531	2025-10-11 16:29:37.531
2550	46	25	1	0	0	1	1	2	-1	0	L	2025-10-11 16:29:37.532	2025-10-11 16:29:37.532
2551	46	22	1	0	0	1	0	2	-2	0	L	2025-10-11 16:29:37.537	2025-10-11 16:29:37.537
2552	46	21	1	1	0	0	2	0	2	3	W	2025-10-11 16:29:37.538	2025-10-11 16:29:37.538
2553	46	28	1	1	0	0	2	1	1	3	W	2025-10-11 16:29:37.541	2025-10-11 16:29:37.541
2554	46	30	1	0	0	1	1	2	-1	0	L	2025-10-11 16:29:37.542	2025-10-11 16:29:37.542
2555	46	31	1	1	0	0	3	1	2	3	W	2025-10-11 16:29:37.545	2025-10-11 16:29:37.545
2556	46	32	1	0	0	1	1	3	-2	0	L	2025-10-11 16:29:37.546	2025-10-11 16:29:37.546
2557	46	36	1	0	0	1	1	2	-1	0	L	2025-10-11 16:29:37.55	2025-10-11 16:29:37.55
2558	46	24	1	1	0	0	2	1	1	3	W	2025-10-11 16:29:37.551	2025-10-11 16:29:37.551
2559	46	33	1	0	1	0	1	1	0	1	D	2025-10-11 16:29:37.554	2025-10-11 16:29:37.554
2560	46	26	1	0	1	0	1	1	0	1	D	2025-10-11 16:29:37.555	2025-10-11 16:29:37.555
2803	9	13	1	1	0	0	2	1	1	3	W	2025-10-27 20:54:36.553	2025-10-27 20:54:36.553
2804	9	2	1	0	0	1	1	2	-1	0	L	2025-10-27 20:54:36.554	2025-10-27 20:54:36.554
2805	9	16	1	1	0	0	2	1	1	3	W	2025-10-27 20:54:36.555	2025-10-27 20:54:36.555
2767	84	56	1	1	0	0	1	0	1	3	W	2025-10-27 20:53:49.754	2025-10-27 20:53:49.754
2768	84	53	1	0	0	1	0	1	-1	0	L	2025-10-27 20:53:49.756	2025-10-27 20:53:49.756
2769	84	44	1	1	0	0	2	0	2	3	W	2025-10-27 20:53:49.757	2025-10-27 20:53:49.757
2770	84	49	1	0	0	1	0	2	-2	0	L	2025-10-27 20:53:49.758	2025-10-27 20:53:49.758
2771	84	46	1	0	0	1	0	3	-3	0	L	2025-10-27 20:53:49.759	2025-10-27 20:53:49.759
2772	84	41	1	1	0	0	3	0	3	3	W	2025-10-27 20:53:49.76	2025-10-27 20:53:49.76
2773	84	42	1	0	0	1	0	6	-6	0	L	2025-10-27 20:53:49.761	2025-10-27 20:53:49.761
2643	83	53	1	1	0	0	3	1	2	3	W	2025-10-19 22:37:28.192	2025-10-19 22:37:28.192
2644	83	46	1	0	0	1	1	3	-2	0	L	2025-10-19 22:37:28.195	2025-10-19 22:37:28.195
2645	83	57	1	0	1	0	1	1	0	1	D	2025-10-19 22:37:28.196	2025-10-19 22:37:28.196
2646	83	42	1	0	1	0	1	1	0	1	D	2025-10-19 22:37:28.197	2025-10-19 22:37:28.197
2647	83	47	1	0	1	0	2	2	0	1	D	2025-10-19 22:37:28.198	2025-10-19 22:37:28.198
2648	83	56	1	0	1	0	2	2	0	1	D	2025-10-19 22:37:28.2	2025-10-19 22:37:28.2
2649	83	54	1	0	0	1	3	4	-1	0	L	2025-10-19 22:37:28.201	2025-10-19 22:37:28.201
2650	83	43	1	1	0	0	4	3	1	3	W	2025-10-19 22:37:28.202	2025-10-19 22:37:28.202
2651	83	52	1	1	0	0	2	1	1	3	W	2025-10-19 22:37:28.203	2025-10-19 22:37:28.203
2652	83	45	1	0	0	1	1	2	-1	0	L	2025-10-19 22:37:28.206	2025-10-19 22:37:28.206
2653	83	58	1	0	0	1	0	3	-3	0	L	2025-10-19 22:37:28.207	2025-10-19 22:37:28.207
2654	83	55	1	1	0	0	3	0	3	3	W	2025-10-19 22:37:28.208	2025-10-19 22:37:28.208
2655	83	41	1	1	0	0	2	1	1	3	W	2025-10-19 22:37:28.209	2025-10-19 22:37:28.209
2656	83	51	1	0	0	1	1	2	-1	0	L	2025-10-19 22:37:28.211	2025-10-19 22:37:28.211
2657	83	50	1	0	1	0	2	2	0	1	D	2025-10-19 22:37:28.212	2025-10-19 22:37:28.212
2658	83	44	1	0	1	0	2	2	0	1	D	2025-10-19 22:37:28.213	2025-10-19 22:37:28.213
2659	83	49	1	0	0	1	0	3	-3	0	L	2025-10-19 22:37:28.214	2025-10-19 22:37:28.214
2660	83	48	1	1	0	0	3	0	3	3	W	2025-10-19 22:37:28.216	2025-10-19 22:37:28.216
2697	8	1	1	1	0	0	2	1	1	3	W	2025-10-24 22:03:50.076	2025-10-24 22:03:50.076
2698	8	16	1	0	0	1	1	2	-1	0	L	2025-10-24 22:03:50.08	2025-10-24 22:03:50.08
2699	8	7	1	1	0	0	2	0	2	3	W	2025-10-24 22:03:50.083	2025-10-24 22:03:50.083
2700	8	13	1	0	0	1	0	2	-2	0	L	2025-10-24 22:03:50.086	2025-10-24 22:03:50.086
2701	8	17	1	0	1	0	3	3	0	1	D	2025-10-24 22:03:50.089	2025-10-24 22:03:50.089
2702	8	6	1	0	1	0	3	3	0	1	D	2025-10-24 22:03:50.091	2025-10-24 22:03:50.091
2703	8	19	1	1	0	0	2	0	2	3	W	2025-10-24 22:03:50.092	2025-10-24 22:03:50.092
2704	8	8	1	0	0	1	0	2	-2	0	L	2025-10-24 22:03:50.094	2025-10-24 22:03:50.094
2705	8	3	1	1	0	0	2	0	2	3	W	2025-10-24 22:03:50.096	2025-10-24 22:03:50.096
2706	8	18	1	0	0	1	0	2	-2	0	L	2025-10-24 22:03:50.099	2025-10-24 22:03:50.099
2707	8	9	1	0	0	1	0	1	-1	0	L	2025-10-24 22:03:50.1	2025-10-24 22:03:50.1
2708	8	5	1	1	0	0	1	0	1	3	W	2025-10-24 22:03:50.102	2025-10-24 22:03:50.102
2709	8	15	1	0	0	1	1	2	-1	0	L	2025-10-24 22:03:50.103	2025-10-24 22:03:50.103
2710	8	11	1	1	0	0	2	1	1	3	W	2025-10-24 22:03:50.104	2025-10-24 22:03:50.104
2711	8	2	1	0	0	1	0	2	-2	0	L	2025-10-24 22:03:50.106	2025-10-24 22:03:50.106
2712	8	12	1	1	0	0	2	0	2	3	W	2025-10-24 22:03:50.107	2025-10-24 22:03:50.107
2713	8	14	1	0	0	1	0	3	-3	0	L	2025-10-24 22:03:50.109	2025-10-24 22:03:50.109
2714	8	10	1	1	0	0	3	0	3	3	W	2025-10-24 22:03:50.11	2025-10-24 22:03:50.11
2715	8	4	1	0	0	1	1	2	-1	0	L	2025-10-24 22:03:50.112	2025-10-24 22:03:50.112
2716	8	20	1	1	0	0	2	1	1	3	W	2025-10-24 22:03:50.113	2025-10-24 22:03:50.113
2717	47	22	1	0	0	1	0	2	-2	0	L	2025-10-24 22:04:03.616	2025-10-24 22:04:03.616
2718	47	36	1	1	0	0	2	0	2	3	W	2025-10-24 22:04:03.617	2025-10-24 22:04:03.617
2719	47	37	1	1	0	0	2	1	1	3	W	2025-10-24 22:04:03.619	2025-10-24 22:04:03.619
2720	47	23	1	0	0	1	1	2	-1	0	L	2025-10-24 22:04:03.62	2025-10-24 22:04:03.62
2721	47	39	1	0	1	0	2	2	0	1	D	2025-10-24 22:04:03.621	2025-10-24 22:04:03.621
2722	47	24	1	0	1	0	2	2	0	1	D	2025-10-24 22:04:03.622	2025-10-24 22:04:03.622
2723	47	26	1	1	0	0	1	0	1	3	W	2025-10-24 22:04:03.623	2025-10-24 22:04:03.623
2724	47	27	1	0	0	1	0	1	-1	0	L	2025-10-24 22:04:03.625	2025-10-24 22:04:03.625
2725	47	32	1	0	1	0	0	0	0	1	D	2025-10-24 22:04:03.626	2025-10-24 22:04:03.626
2726	47	28	1	0	1	0	0	0	0	1	D	2025-10-24 22:04:03.627	2025-10-24 22:04:03.627
2727	47	33	1	0	1	0	1	1	0	1	D	2025-10-24 22:04:03.628	2025-10-24 22:04:03.628
2728	47	38	1	0	1	0	1	1	0	1	D	2025-10-24 22:04:03.629	2025-10-24 22:04:03.629
2729	47	21	1	0	0	1	0	2	-2	0	L	2025-10-24 22:04:03.63	2025-10-24 22:04:03.63
2730	47	34	1	1	0	0	2	0	2	3	W	2025-10-24 22:04:03.631	2025-10-24 22:04:03.631
2731	47	25	1	0	0	1	0	1	-1	0	L	2025-10-24 22:04:03.632	2025-10-24 22:04:03.632
2732	47	29	1	1	0	0	1	0	1	3	W	2025-10-24 22:04:03.633	2025-10-24 22:04:03.633
2733	47	31	1	0	1	0	0	0	0	1	D	2025-10-24 22:04:03.634	2025-10-24 22:04:03.634
2734	47	40	1	0	1	0	0	0	0	1	D	2025-10-24 22:04:03.635	2025-10-24 22:04:03.635
2735	47	35	1	0	0	1	1	3	-2	0	L	2025-10-24 22:04:03.636	2025-10-24 22:04:03.636
2736	47	30	1	1	0	0	3	1	2	3	W	2025-10-24 22:04:03.637	2025-10-24 22:04:03.637
2806	9	9	1	0	0	1	1	2	-1	0	L	2025-10-27 20:54:36.556	2025-10-27 20:54:36.556
2807	9	10	1	0	0	1	1	2	-1	0	L	2025-10-27 20:54:36.558	2025-10-27 20:54:36.558
2808	9	3	1	1	0	0	2	1	1	3	W	2025-10-27 20:54:36.559	2025-10-27 20:54:36.559
2809	9	11	1	1	0	0	4	2	2	3	W	2025-10-27 20:54:36.56	2025-10-27 20:54:36.56
2810	9	1	1	0	0	1	2	4	-2	0	L	2025-10-27 20:54:36.561	2025-10-27 20:54:36.561
2811	9	12	1	1	0	0	3	2	1	3	W	2025-10-27 20:54:36.563	2025-10-27 20:54:36.563
2812	9	15	1	0	0	1	2	3	-1	0	L	2025-10-27 20:54:36.564	2025-10-27 20:54:36.564
2813	9	5	1	1	0	0	1	0	1	3	W	2025-10-27 20:54:36.565	2025-10-27 20:54:36.565
2814	9	17	1	0	0	1	0	1	-1	0	L	2025-10-27 20:54:36.566	2025-10-27 20:54:36.566
2815	9	6	1	1	0	0	2	0	2	3	W	2025-10-27 20:54:36.567	2025-10-27 20:54:36.567
2816	9	14	1	0	0	1	0	2	-2	0	L	2025-10-27 20:54:36.568	2025-10-27 20:54:36.568
2817	9	20	1	1	0	0	1	0	1	3	W	2025-10-27 20:54:36.57	2025-10-27 20:54:36.57
2818	9	19	1	0	0	1	0	1	-1	0	L	2025-10-27 20:54:36.571	2025-10-27 20:54:36.571
2819	9	18	1	0	0	1	2	3	-1	0	L	2025-10-27 20:54:36.572	2025-10-27 20:54:36.572
2820	9	7	1	1	0	0	3	2	1	3	W	2025-10-27 20:54:36.573	2025-10-27 20:54:36.573
2821	9	8	1	0	0	1	0	3	-3	0	L	2025-10-27 20:54:36.575	2025-10-27 20:54:36.575
2822	9	4	1	1	0	0	3	0	3	3	W	2025-10-27 20:54:36.576	2025-10-27 20:54:36.576
2823	111	65	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:41.207	2025-10-27 20:57:41.207
2824	111	70	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:41.209	2025-10-27 20:57:41.209
2825	111	76	1	0	0	1	0	2	-2	0	L	2025-10-27 20:57:41.21	2025-10-27 20:57:41.21
2826	111	72	1	1	0	0	2	0	2	3	W	2025-10-27 20:57:41.211	2025-10-27 20:57:41.211
2827	111	71	1	0	0	1	1	2	-1	0	L	2025-10-27 20:57:41.212	2025-10-27 20:57:41.212
2828	111	63	1	1	0	0	2	1	1	3	W	2025-10-27 20:57:41.214	2025-10-27 20:57:41.214
2829	111	75	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:41.215	2025-10-27 20:57:41.215
2830	111	60	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:41.216	2025-10-27 20:57:41.216
2831	111	61	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.217	2025-10-27 20:57:41.217
2832	111	64	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.218	2025-10-27 20:57:41.218
2833	111	62	1	1	0	0	2	0	2	3	W	2025-10-27 20:57:41.219	2025-10-27 20:57:41.219
2834	111	69	1	0	0	1	0	2	-2	0	L	2025-10-27 20:57:41.22	2025-10-27 20:57:41.22
2835	111	59	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.222	2025-10-27 20:57:41.222
2836	111	74	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.223	2025-10-27 20:57:41.223
2837	111	68	1	1	0	0	2	0	2	3	W	2025-10-27 20:57:41.224	2025-10-27 20:57:41.224
2838	111	73	1	0	0	1	0	2	-2	0	L	2025-10-27 20:57:41.225	2025-10-27 20:57:41.225
2839	111	78	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.227	2025-10-27 20:57:41.227
2840	111	66	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:41.228	2025-10-27 20:57:41.228
2841	111	67	1	1	0	0	5	0	5	3	W	2025-10-27 20:57:41.229	2025-10-27 20:57:41.229
2842	111	77	1	0	0	1	0	5	-5	0	L	2025-10-27 20:57:41.23	2025-10-27 20:57:41.23
2843	112	63	1	1	0	0	3	2	1	3	W	2025-10-27 20:57:49.484	2025-10-27 20:57:49.484
2844	112	76	1	0	0	1	2	3	-1	0	L	2025-10-27 20:57:49.485	2025-10-27 20:57:49.485
2845	112	70	1	0	0	1	0	2	-2	0	L	2025-10-27 20:57:49.486	2025-10-27 20:57:49.486
2846	112	71	1	1	0	0	2	0	2	3	W	2025-10-27 20:57:49.487	2025-10-27 20:57:49.487
2847	112	60	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:49.488	2025-10-27 20:57:49.488
2848	112	62	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:49.489	2025-10-27 20:57:49.489
2849	112	73	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:49.49	2025-10-27 20:57:49.49
2850	112	59	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:49.492	2025-10-27 20:57:49.492
2851	112	72	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:49.493	2025-10-27 20:57:49.493
2852	112	61	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:49.494	2025-10-27 20:57:49.494
2853	112	74	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:49.496	2025-10-27 20:57:49.496
2854	112	75	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:49.497	2025-10-27 20:57:49.497
2855	112	65	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:49.498	2025-10-27 20:57:49.498
2856	112	68	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:49.499	2025-10-27 20:57:49.499
2857	112	77	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:49.5	2025-10-27 20:57:49.5
2858	112	64	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:49.502	2025-10-27 20:57:49.502
2859	112	67	1	0	0	1	1	2	-1	0	L	2025-10-27 20:57:49.503	2025-10-27 20:57:49.503
2860	112	78	1	1	0	0	2	1	1	3	W	2025-10-27 20:57:49.504	2025-10-27 20:57:49.504
2861	112	69	1	1	0	0	4	0	4	3	W	2025-10-27 20:57:49.505	2025-10-27 20:57:49.505
2862	112	66	1	0	0	1	0	4	-4	0	L	2025-10-27 20:57:49.506	2025-10-27 20:57:49.506
2863	113	61	1	1	0	0	2	0	2	3	W	2025-10-27 20:57:58.102	2025-10-27 20:57:58.102
2864	113	73	1	0	0	1	0	2	-2	0	L	2025-10-27 20:57:58.104	2025-10-27 20:57:58.104
2865	113	68	1	1	0	0	4	3	1	3	W	2025-10-27 20:57:58.105	2025-10-27 20:57:58.105
2866	113	67	1	0	0	1	3	4	-1	0	L	2025-10-27 20:57:58.106	2025-10-27 20:57:58.106
2867	113	64	1	0	0	1	1	3	-2	0	L	2025-10-27 20:57:58.107	2025-10-27 20:57:58.107
2868	113	72	1	1	0	0	3	1	2	3	W	2025-10-27 20:57:58.108	2025-10-27 20:57:58.108
2869	113	75	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:58.109	2025-10-27 20:57:58.109
2870	113	77	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:58.11	2025-10-27 20:57:58.11
2871	113	59	1	1	0	0	4	1	3	3	W	2025-10-27 20:57:58.111	2025-10-27 20:57:58.111
2872	113	70	1	0	0	1	1	4	-3	0	L	2025-10-27 20:57:58.112	2025-10-27 20:57:58.112
2873	113	74	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:58.114	2025-10-27 20:57:58.114
2874	113	78	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:58.115	2025-10-27 20:57:58.115
2875	113	76	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:58.116	2025-10-27 20:57:58.116
2876	113	69	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:58.117	2025-10-27 20:57:58.117
2877	113	71	1	1	0	0	1	0	1	3	W	2025-10-27 20:57:58.119	2025-10-27 20:57:58.119
2878	113	60	1	0	0	1	0	1	-1	0	L	2025-10-27 20:57:58.12	2025-10-27 20:57:58.12
2879	113	66	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:58.121	2025-10-27 20:57:58.121
2880	113	63	1	0	1	0	0	0	0	1	D	2025-10-27 20:57:58.122	2025-10-27 20:57:58.122
2881	113	62	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:58.123	2025-10-27 20:57:58.123
2882	113	65	1	0	1	0	1	1	0	1	D	2025-10-27 20:57:58.124	2025-10-27 20:57:58.124
2883	114	70	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:03.246	2025-10-27 20:58:03.246
2884	114	61	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:03.247	2025-10-27 20:58:03.247
2885	114	60	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:03.248	2025-10-27 20:58:03.248
2886	114	65	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:03.249	2025-10-27 20:58:03.249
2887	114	66	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:03.251	2025-10-27 20:58:03.251
2888	114	68	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:03.252	2025-10-27 20:58:03.252
2889	114	78	1	0	0	1	0	3	-3	0	L	2025-10-27 20:58:03.253	2025-10-27 20:58:03.253
2890	114	71	1	1	0	0	3	0	3	3	W	2025-10-27 20:58:03.254	2025-10-27 20:58:03.254
2891	114	69	1	0	0	1	0	1	-1	0	L	2025-10-27 20:58:03.255	2025-10-27 20:58:03.255
2892	114	75	1	1	0	0	1	0	1	3	W	2025-10-27 20:58:03.257	2025-10-27 20:58:03.257
2893	114	77	1	0	0	1	0	3	-3	0	L	2025-10-27 20:58:03.258	2025-10-27 20:58:03.258
2894	114	59	1	1	0	0	3	0	3	3	W	2025-10-27 20:58:03.26	2025-10-27 20:58:03.26
2895	114	63	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:03.261	2025-10-27 20:58:03.261
2896	114	73	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:03.262	2025-10-27 20:58:03.262
2897	114	64	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:03.264	2025-10-27 20:58:03.264
2898	114	62	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:03.266	2025-10-27 20:58:03.266
2899	114	67	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:03.267	2025-10-27 20:58:03.267
2900	114	76	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:03.268	2025-10-27 20:58:03.268
2901	114	72	1	1	0	0	3	2	1	3	W	2025-10-27 20:58:03.269	2025-10-27 20:58:03.269
2902	114	74	1	0	0	1	2	3	-1	0	L	2025-10-27 20:58:03.27	2025-10-27 20:58:03.27
2903	115	62	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:06.374	2025-10-27 20:58:06.374
2904	115	63	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:06.375	2025-10-27 20:58:06.375
2905	115	68	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:06.377	2025-10-27 20:58:06.377
2906	115	59	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:06.378	2025-10-27 20:58:06.378
2907	115	61	1	0	0	1	0	2	-2	0	L	2025-10-27 20:58:06.38	2025-10-27 20:58:06.38
2908	115	67	1	1	0	0	2	0	2	3	W	2025-10-27 20:58:06.381	2025-10-27 20:58:06.381
2909	115	76	1	1	0	0	3	1	2	3	W	2025-10-27 20:58:06.382	2025-10-27 20:58:06.382
2910	115	78	1	0	0	1	1	3	-2	0	L	2025-10-27 20:58:06.383	2025-10-27 20:58:06.383
2911	115	75	1	1	0	0	2	0	2	3	W	2025-10-27 20:58:06.384	2025-10-27 20:58:06.384
2912	115	66	1	0	0	1	0	2	-2	0	L	2025-10-27 20:58:06.385	2025-10-27 20:58:06.385
2913	115	74	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:06.386	2025-10-27 20:58:06.386
2914	115	64	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:06.387	2025-10-27 20:58:06.387
2915	115	70	1	0	1	0	2	2	0	1	D	2025-10-27 20:58:06.388	2025-10-27 20:58:06.388
2916	115	60	1	0	1	0	2	2	0	1	D	2025-10-27 20:58:06.39	2025-10-27 20:58:06.39
2917	115	71	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:06.391	2025-10-27 20:58:06.391
2918	115	72	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:06.392	2025-10-27 20:58:06.392
2919	115	73	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:06.394	2025-10-27 20:58:06.394
2920	115	77	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:06.396	2025-10-27 20:58:06.396
2921	115	65	1	0	0	1	0	3	-3	0	L	2025-10-27 20:58:06.397	2025-10-27 20:58:06.397
2922	115	69	1	1	0	0	3	0	3	3	W	2025-10-27 20:58:06.398	2025-10-27 20:58:06.398
2923	116	66	1	0	0	1	0	1	-1	0	L	2025-10-27 20:58:09.254	2025-10-27 20:58:09.254
2924	116	76	1	1	0	0	1	0	1	3	W	2025-10-27 20:58:09.255	2025-10-27 20:58:09.255
2925	116	69	1	0	1	0	3	3	0	1	D	2025-10-27 20:58:09.256	2025-10-27 20:58:09.256
2926	116	77	1	0	1	0	3	3	0	1	D	2025-10-27 20:58:09.258	2025-10-27 20:58:09.258
2927	116	73	1	0	0	1	0	1	-1	0	L	2025-10-27 20:58:09.259	2025-10-27 20:58:09.259
2928	116	70	1	1	0	0	1	0	1	3	W	2025-10-27 20:58:09.26	2025-10-27 20:58:09.26
2929	116	67	1	1	0	0	4	1	3	3	W	2025-10-27 20:58:09.262	2025-10-27 20:58:09.262
2930	116	63	1	0	0	1	1	4	-3	0	L	2025-10-27 20:58:09.263	2025-10-27 20:58:09.263
2931	116	59	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:09.265	2025-10-27 20:58:09.265
2932	116	62	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:09.266	2025-10-27 20:58:09.266
2933	116	78	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:09.267	2025-10-27 20:58:09.267
2934	116	61	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:09.268	2025-10-27 20:58:09.268
2935	116	64	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:09.269	2025-10-27 20:58:09.269
2936	116	75	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:09.271	2025-10-27 20:58:09.271
2937	116	60	1	1	0	0	4	0	4	3	W	2025-10-27 20:58:09.272	2025-10-27 20:58:09.272
2938	116	74	1	0	0	1	0	4	-4	0	L	2025-10-27 20:58:09.274	2025-10-27 20:58:09.274
2939	116	72	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:09.276	2025-10-27 20:58:09.276
2940	116	65	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:09.277	2025-10-27 20:58:09.277
2941	116	68	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:09.28	2025-10-27 20:58:09.28
2942	116	71	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:09.281	2025-10-27 20:58:09.281
2943	117	74	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.208	2025-10-27 20:58:12.208
2944	117	66	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.21	2025-10-27 20:58:12.21
2945	117	70	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.211	2025-10-27 20:58:12.211
2946	117	76	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.212	2025-10-27 20:58:12.212
2947	117	77	1	1	0	0	1	0	1	3	W	2025-10-27 20:58:12.213	2025-10-27 20:58:12.213
2948	117	72	1	0	0	1	0	1	-1	0	L	2025-10-27 20:58:12.214	2025-10-27 20:58:12.214
2949	117	75	1	0	0	1	0	1	-1	0	L	2025-10-27 20:58:12.216	2025-10-27 20:58:12.216
2950	117	67	1	1	0	0	1	0	1	3	W	2025-10-27 20:58:12.217	2025-10-27 20:58:12.217
2951	117	62	1	1	0	0	2	0	2	3	W	2025-10-27 20:58:12.219	2025-10-27 20:58:12.219
2952	117	68	1	0	0	1	0	2	-2	0	L	2025-10-27 20:58:12.22	2025-10-27 20:58:12.22
2953	117	61	1	0	0	1	0	2	-2	0	L	2025-10-27 20:58:12.221	2025-10-27 20:58:12.221
2954	117	60	1	1	0	0	2	0	2	3	W	2025-10-27 20:58:12.222	2025-10-27 20:58:12.222
2955	117	65	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.224	2025-10-27 20:58:12.224
2956	117	73	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.225	2025-10-27 20:58:12.225
2957	117	59	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.226	2025-10-27 20:58:12.226
2958	117	69	1	0	1	0	0	0	0	1	D	2025-10-27 20:58:12.227	2025-10-27 20:58:12.227
2959	117	71	1	1	0	0	2	1	1	3	W	2025-10-27 20:58:12.229	2025-10-27 20:58:12.229
2960	117	64	1	0	0	1	1	2	-1	0	L	2025-10-27 20:58:12.23	2025-10-27 20:58:12.23
2961	117	63	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:12.232	2025-10-27 20:58:12.232
2962	117	78	1	0	1	0	1	1	0	1	D	2025-10-27 20:58:12.234	2025-10-27 20:58:12.234
2983	118	71	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.306	2025-10-27 20:59:19.306
2984	118	74	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.307	2025-10-27 20:59:19.307
2985	118	73	1	0	1	0	0	0	0	1	D	2025-10-27 20:59:19.308	2025-10-27 20:59:19.308
2986	118	62	1	0	1	0	0	0	0	1	D	2025-10-27 20:59:19.309	2025-10-27 20:59:19.309
2987	118	78	1	1	0	0	3	2	1	3	W	2025-10-27 20:59:19.311	2025-10-27 20:59:19.311
2988	118	70	1	0	0	1	2	3	-1	0	L	2025-10-27 20:59:19.312	2025-10-27 20:59:19.312
2989	118	72	1	1	0	0	3	1	2	3	W	2025-10-27 20:59:19.313	2025-10-27 20:59:19.313
2990	118	67	1	0	0	1	1	3	-2	0	L	2025-10-27 20:59:19.314	2025-10-27 20:59:19.314
2991	118	63	1	0	1	0	1	1	0	1	D	2025-10-27 20:59:19.315	2025-10-27 20:59:19.315
2992	118	59	1	0	1	0	1	1	0	1	D	2025-10-27 20:59:19.317	2025-10-27 20:59:19.317
2993	118	77	1	1	0	0	2	1	1	3	W	2025-10-27 20:59:19.319	2025-10-27 20:59:19.319
2994	118	65	1	0	0	1	1	2	-1	0	L	2025-10-27 20:59:19.32	2025-10-27 20:59:19.32
2995	118	66	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.321	2025-10-27 20:59:19.321
2996	118	61	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.322	2025-10-27 20:59:19.322
2997	118	76	1	0	0	1	0	1	-1	0	L	2025-10-27 20:59:19.323	2025-10-27 20:59:19.323
2998	118	75	1	1	0	0	1	0	1	3	W	2025-10-27 20:59:19.324	2025-10-27 20:59:19.324
2999	118	64	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.325	2025-10-27 20:59:19.325
3000	118	60	1	0	1	0	2	2	0	1	D	2025-10-27 20:59:19.326	2025-10-27 20:59:19.326
3001	118	69	1	1	0	0	1	0	1	3	W	2025-10-27 20:59:19.327	2025-10-27 20:59:19.327
3002	118	68	1	0	0	1	0	1	-1	0	L	2025-10-27 20:59:19.328	2025-10-27 20:59:19.328
3003	48	38	1	1	0	0	2	1	1	3	W	2025-10-27 21:01:05	2025-10-27 21:01:05
3004	48	35	1	0	0	1	1	2	-1	0	L	2025-10-27 21:01:05.002	2025-10-27 21:01:05.002
3005	48	23	1	0	1	0	3	3	0	1	D	2025-10-27 21:01:05.003	2025-10-27 21:01:05.003
3006	48	22	1	0	1	0	3	3	0	1	D	2025-10-27 21:01:05.005	2025-10-27 21:01:05.005
3007	48	36	1	1	0	0	1	0	1	3	W	2025-10-27 21:01:05.007	2025-10-27 21:01:05.007
3008	48	32	1	0	0	1	0	1	-1	0	L	2025-10-27 21:01:05.008	2025-10-27 21:01:05.008
3009	48	28	1	0	0	1	0	1	-1	0	L	2025-10-27 21:01:05.009	2025-10-27 21:01:05.009
3010	48	25	1	1	0	0	1	0	1	3	W	2025-10-27 21:01:05.01	2025-10-27 21:01:05.01
3011	48	40	1	0	0	1	0	2	-2	0	L	2025-10-27 21:01:05.011	2025-10-27 21:01:05.011
3012	48	39	1	1	0	0	2	0	2	3	W	2025-10-27 21:01:05.013	2025-10-27 21:01:05.013
3013	48	30	1	0	1	0	1	1	0	1	D	2025-10-27 21:01:05.014	2025-10-27 21:01:05.014
3014	48	21	1	0	1	0	1	1	0	1	D	2025-10-27 21:01:05.015	2025-10-27 21:01:05.015
3015	48	29	1	1	0	0	2	1	1	3	W	2025-10-27 21:01:05.016	2025-10-27 21:01:05.016
3016	48	37	1	0	0	1	1	2	-1	0	L	2025-10-27 21:01:05.017	2025-10-27 21:01:05.017
3017	48	27	1	0	0	1	2	3	-1	0	L	2025-10-27 21:01:05.018	2025-10-27 21:01:05.018
3018	48	33	1	1	0	0	3	2	1	3	W	2025-10-27 21:01:05.019	2025-10-27 21:01:05.019
3019	48	34	1	1	0	0	1	0	1	3	W	2025-10-27 21:01:05.02	2025-10-27 21:01:05.02
3020	48	31	1	0	0	1	0	1	-1	0	L	2025-10-27 21:01:05.022	2025-10-27 21:01:05.022
3021	48	24	1	0	0	1	0	2	-2	0	L	2025-10-27 21:49:38.464	2025-10-27 21:49:38.464
3022	48	26	1	1	0	0	2	0	2	3	W	2025-10-27 21:49:38.466	2025-10-27 21:49:38.466
3023	10	1	1	1	0	0	3	0	3	3	W	2025-11-03 12:50:51.771	2025-11-03 12:50:51.771
3024	10	13	1	0	0	1	0	3	-3	0	L	2025-11-03 12:50:51.775	2025-11-03 12:50:51.775
3025	10	17	1	1	0	0	2	0	2	3	W	2025-11-03 12:50:51.776	2025-11-03 12:50:51.776
3026	10	12	1	0	0	1	0	2	-2	0	L	2025-11-03 12:50:51.777	2025-11-03 12:50:51.777
3027	10	7	1	0	0	1	0	2	-2	0	L	2025-11-03 12:50:51.778	2025-11-03 12:50:51.778
3028	10	5	1	1	0	0	2	0	2	3	W	2025-11-03 12:50:51.78	2025-11-03 12:50:51.78
3029	10	9	1	1	0	0	3	0	3	3	W	2025-11-03 12:50:51.782	2025-11-03 12:50:51.782
3030	10	18	1	0	0	1	0	3	-3	0	L	2025-11-03 12:50:51.783	2025-11-03 12:50:51.783
3031	10	14	1	0	1	0	2	2	0	1	D	2025-11-03 12:50:51.784	2025-11-03 12:50:51.784
3032	10	11	1	0	1	0	2	2	0	1	D	2025-11-03 12:50:51.785	2025-11-03 12:50:51.785
3033	10	4	1	0	0	1	0	1	-1	0	L	2025-11-03 12:50:51.786	2025-11-03 12:50:51.786
3034	10	10	1	1	0	0	1	0	1	3	W	2025-11-03 12:50:51.787	2025-11-03 12:50:51.787
3035	10	15	1	1	0	0	2	0	2	3	W	2025-11-03 12:50:51.788	2025-11-03 12:50:51.788
3036	10	20	1	0	0	1	0	2	-2	0	L	2025-11-03 12:50:51.789	2025-11-03 12:50:51.789
3037	10	2	1	1	0	0	3	1	2	3	W	2025-11-03 12:50:51.791	2025-11-03 12:50:51.791
3038	10	16	1	0	0	1	1	3	-2	0	L	2025-11-03 12:50:51.792	2025-11-03 12:50:51.792
3039	10	19	1	1	0	0	3	1	2	3	W	2025-11-03 12:50:51.793	2025-11-03 12:50:51.793
3040	10	6	1	0	0	1	1	3	-2	0	L	2025-11-03 12:50:51.794	2025-11-03 12:50:51.794
3041	49	25	1	1	0	0	2	1	1	3	W	2025-11-03 12:51:10.553	2025-11-03 12:51:10.553
3042	49	23	1	0	0	1	1	2	-1	0	L	2025-11-03 12:51:10.554	2025-11-03 12:51:10.554
3043	49	39	1	1	0	0	4	0	4	3	W	2025-11-03 12:51:10.555	2025-11-03 12:51:10.555
3044	49	34	1	0	0	1	0	4	-4	0	L	2025-11-03 12:51:10.556	2025-11-03 12:51:10.556
3045	49	26	1	1	0	0	3	0	3	3	W	2025-11-03 12:51:10.558	2025-11-03 12:51:10.558
3046	49	35	1	0	0	1	0	3	-3	0	L	2025-11-03 12:51:10.559	2025-11-03 12:51:10.559
3047	49	38	1	1	0	0	3	2	1	3	W	2025-11-03 12:51:10.56	2025-11-03 12:51:10.56
3048	49	28	1	0	0	1	2	3	-1	0	L	2025-11-03 12:51:10.561	2025-11-03 12:51:10.561
3049	49	29	1	1	0	0	4	0	4	3	W	2025-11-03 12:51:10.563	2025-11-03 12:51:10.563
3050	49	40	1	0	0	1	0	4	-4	0	L	2025-11-03 12:51:10.565	2025-11-03 12:51:10.565
3051	49	21	1	0	0	1	1	2	-1	0	L	2025-11-03 12:51:10.566	2025-11-03 12:51:10.566
3052	49	33	1	1	0	0	2	1	1	3	W	2025-11-03 12:51:10.567	2025-11-03 12:51:10.567
3053	49	31	1	1	0	0	2	1	1	3	W	2025-11-03 12:51:10.568	2025-11-03 12:51:10.568
3054	49	36	1	0	0	1	1	2	-1	0	L	2025-11-03 12:51:10.569	2025-11-03 12:51:10.569
3055	49	37	1	1	0	0	3	1	2	3	W	2025-11-03 12:51:10.57	2025-11-03 12:51:10.57
3056	49	32	1	0	0	1	1	3	-2	0	L	2025-11-03 12:51:10.571	2025-11-03 12:51:10.571
3057	49	24	1	1	0	0	3	0	3	3	W	2025-11-03 12:51:10.573	2025-11-03 12:51:10.573
3058	49	30	1	0	0	1	0	3	-3	0	L	2025-11-03 12:51:10.574	2025-11-03 12:51:10.574
\.


--
-- Data for Name: TeamLeague; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeamLeague" (id, "teamId", "leagueId", "isActive", "createdAt", "updatedAt") FROM stdin;
1	5	1	t	2025-10-25 00:52:58.045	2025-10-25 00:52:58.045
2	6	1	t	2025-10-25 00:52:58.049	2025-10-25 00:52:58.049
3	7	1	t	2025-10-25 00:52:58.051	2025-10-25 00:52:58.051
4	8	1	t	2025-10-25 00:52:58.052	2025-10-25 00:52:58.052
5	18	1	t	2025-10-25 00:52:58.053	2025-10-25 00:52:58.053
6	19	1	t	2025-10-25 00:52:58.054	2025-10-25 00:52:58.054
7	20	1	t	2025-10-25 00:52:58.054	2025-10-25 00:52:58.054
8	24	2	t	2025-10-25 00:52:58.055	2025-10-25 00:52:58.055
9	28	2	t	2025-10-25 00:52:58.056	2025-10-25 00:52:58.056
10	29	2	t	2025-10-25 00:52:58.056	2025-10-25 00:52:58.056
11	33	2	t	2025-10-25 00:52:58.057	2025-10-25 00:52:58.057
12	35	2	t	2025-10-25 00:52:58.058	2025-10-25 00:52:58.058
13	37	2	t	2025-10-25 00:52:58.058	2025-10-25 00:52:58.058
14	38	2	t	2025-10-25 00:52:58.059	2025-10-25 00:52:58.059
15	40	2	t	2025-10-25 00:52:58.06	2025-10-25 00:52:58.06
16	43	3	t	2025-10-25 00:52:58.061	2025-10-25 00:52:58.061
17	51	3	t	2025-10-25 00:52:58.062	2025-10-25 00:52:58.062
18	53	3	t	2025-10-25 00:52:58.062	2025-10-25 00:52:58.062
19	13	1	t	2025-10-25 00:52:58.063	2025-10-25 00:52:58.063
20	16	1	t	2025-10-25 00:52:58.064	2025-10-25 00:52:58.064
21	1	1	t	2025-10-25 00:52:58.064	2025-10-25 00:52:58.064
22	2	1	t	2025-10-25 00:52:58.065	2025-10-25 00:52:58.065
23	3	1	t	2025-10-25 00:52:58.065	2025-10-25 00:52:58.065
24	4	1	t	2025-10-25 00:52:58.066	2025-10-25 00:52:58.066
25	9	1	t	2025-10-25 00:52:58.067	2025-10-25 00:52:58.067
26	10	1	t	2025-10-25 00:52:58.067	2025-10-25 00:52:58.067
27	11	1	t	2025-10-25 00:52:58.068	2025-10-25 00:52:58.068
28	12	1	t	2025-10-25 00:52:58.069	2025-10-25 00:52:58.069
29	14	1	t	2025-10-25 00:52:58.069	2025-10-25 00:52:58.069
30	15	1	t	2025-10-25 00:52:58.07	2025-10-25 00:52:58.07
31	17	1	t	2025-10-25 00:52:58.071	2025-10-25 00:52:58.071
32	54	3	t	2025-10-25 00:52:58.071	2025-10-25 00:52:58.071
33	50	3	t	2025-10-25 00:52:58.072	2025-10-25 00:52:58.072
34	55	3	t	2025-10-25 00:52:58.073	2025-10-25 00:52:58.073
35	39	2	t	2025-10-25 00:52:58.073	2025-10-25 00:52:58.073
36	36	2	t	2025-10-25 00:52:58.074	2025-10-25 00:52:58.074
37	34	2	t	2025-10-25 00:52:58.074	2025-10-25 00:52:58.074
38	32	2	t	2025-10-25 00:52:58.075	2025-10-25 00:52:58.075
39	31	2	t	2025-10-25 00:52:58.076	2025-10-25 00:52:58.076
40	30	2	t	2025-10-25 00:52:58.076	2025-10-25 00:52:58.076
41	27	2	t	2025-10-25 00:52:58.077	2025-10-25 00:52:58.077
42	26	2	t	2025-10-25 00:52:58.078	2025-10-25 00:52:58.078
43	25	2	t	2025-10-25 00:52:58.078	2025-10-25 00:52:58.078
44	23	2	t	2025-10-25 00:52:58.079	2025-10-25 00:52:58.079
45	22	2	t	2025-10-25 00:52:58.08	2025-10-25 00:52:58.08
46	21	2	t	2025-10-25 00:52:58.08	2025-10-25 00:52:58.08
47	49	3	t	2025-10-25 00:52:58.081	2025-10-25 00:52:58.081
48	48	3	t	2025-10-25 00:52:58.082	2025-10-25 00:52:58.082
49	47	3	t	2025-10-25 00:52:58.082	2025-10-25 00:52:58.082
50	46	3	t	2025-10-25 00:52:58.083	2025-10-25 00:52:58.083
51	45	3	t	2025-10-25 00:52:58.083	2025-10-25 00:52:58.083
52	44	3	t	2025-10-25 00:52:58.084	2025-10-25 00:52:58.084
53	42	3	t	2025-10-25 00:52:58.085	2025-10-25 00:52:58.085
54	41	3	t	2025-10-25 00:52:58.085	2025-10-25 00:52:58.085
55	59	4	t	2025-10-25 00:52:58.086	2025-10-25 00:52:58.086
56	60	4	t	2025-10-25 00:52:58.087	2025-10-25 00:52:58.087
57	61	4	t	2025-10-25 00:52:58.087	2025-10-25 00:52:58.087
58	62	4	t	2025-10-25 00:52:58.088	2025-10-25 00:52:58.088
59	63	4	t	2025-10-25 00:52:58.088	2025-10-25 00:52:58.088
60	64	4	t	2025-10-25 00:52:58.089	2025-10-25 00:52:58.089
61	65	4	t	2025-10-25 00:52:58.09	2025-10-25 00:52:58.09
62	66	4	t	2025-10-25 00:52:58.09	2025-10-25 00:52:58.09
63	67	4	t	2025-10-25 00:52:58.091	2025-10-25 00:52:58.091
64	68	4	t	2025-10-25 00:52:58.092	2025-10-25 00:52:58.092
65	69	4	t	2025-10-25 00:52:58.092	2025-10-25 00:52:58.092
66	70	4	t	2025-10-25 00:52:58.093	2025-10-25 00:52:58.093
67	71	4	t	2025-10-25 00:52:58.094	2025-10-25 00:52:58.094
68	72	4	t	2025-10-25 00:52:58.094	2025-10-25 00:52:58.094
69	73	4	t	2025-10-25 00:52:58.095	2025-10-25 00:52:58.095
70	75	4	t	2025-10-25 00:52:58.096	2025-10-25 00:52:58.096
71	77	4	t	2025-10-25 00:52:58.096	2025-10-25 00:52:58.096
72	78	4	t	2025-10-25 00:52:58.097	2025-10-25 00:52:58.097
73	76	4	t	2025-10-25 00:52:58.098	2025-10-25 00:52:58.098
74	74	4	t	2025-10-25 00:52:58.098	2025-10-25 00:52:58.098
75	58	3	t	2025-10-25 00:52:58.099	2025-10-25 00:52:58.099
76	52	3	t	2025-10-25 00:52:58.099	2025-10-25 00:52:58.099
77	56	3	t	2025-10-25 00:52:58.1	2025-10-25 00:52:58.1
78	57	3	t	2025-10-25 00:52:58.101	2025-10-25 00:52:58.101
80	43	5	t	2025-10-25 11:53:56.252	2025-10-25 11:53:56.252
81	51	5	t	2025-10-25 11:53:56.261	2025-10-25 11:53:56.261
82	41	5	t	2025-10-25 11:53:56.264	2025-10-25 11:53:56.264
83	44	5	t	2025-10-25 11:53:56.266	2025-10-25 11:53:56.266
84	5	5	t	2025-10-25 11:53:56.268	2025-10-25 11:53:56.268
85	10	5	t	2025-10-25 11:53:56.271	2025-10-25 11:53:56.271
86	15	5	t	2025-10-25 11:53:56.273	2025-10-25 11:53:56.273
87	19	5	t	2025-10-25 11:53:56.275	2025-10-25 11:53:56.275
88	16	5	t	2025-10-25 11:53:56.278	2025-10-25 11:53:56.278
89	4	5	t	2025-10-25 11:53:56.28	2025-10-25 11:53:56.28
90	28	5	t	2025-10-25 11:53:56.282	2025-10-25 11:53:56.282
91	26	5	t	2025-10-25 11:53:56.284	2025-10-25 11:53:56.284
92	37	5	t	2025-10-25 11:53:56.286	2025-10-25 11:53:56.286
93	29	5	t	2025-10-25 11:53:56.288	2025-10-25 11:53:56.288
94	39	5	t	2025-10-25 11:53:56.291	2025-10-25 11:53:56.291
95	59	5	t	2025-10-25 11:53:56.294	2025-10-25 11:53:56.294
96	67	5	t	2025-10-25 11:53:56.296	2025-10-25 11:53:56.296
97	68	5	t	2025-10-25 11:53:56.299	2025-10-25 11:53:56.299
98	72	5	t	2025-10-25 11:53:56.301	2025-10-25 11:53:56.301
99	79	5	t	2025-10-25 11:53:56.304	2025-10-25 11:53:56.304
100	80	5	t	2025-10-25 11:53:56.31	2025-10-25 11:53:56.31
101	81	5	t	2025-10-25 11:53:56.313	2025-10-25 11:53:56.313
102	82	5	t	2025-10-25 11:53:56.316	2025-10-25 11:53:56.316
103	83	5	t	2025-10-25 11:53:56.32	2025-10-25 11:53:56.32
104	84	5	t	2025-10-25 11:53:56.325	2025-10-25 11:53:56.325
105	85	5	t	2025-10-25 11:53:56.329	2025-10-25 11:53:56.329
106	86	5	t	2025-10-25 11:53:56.332	2025-10-25 11:53:56.332
107	87	5	t	2025-10-25 11:53:56.334	2025-10-25 11:53:56.334
108	88	5	t	2025-10-25 11:53:56.337	2025-10-25 11:53:56.337
109	89	5	t	2025-10-25 11:53:56.34	2025-10-25 11:53:56.34
110	90	5	t	2025-10-25 11:53:56.344	2025-10-25 11:53:56.344
111	91	5	t	2025-10-25 11:53:56.347	2025-10-25 11:53:56.347
112	92	5	t	2025-10-25 11:53:56.351	2025-10-25 11:53:56.351
113	93	5	t	2025-10-25 11:53:56.354	2025-10-25 11:53:56.354
114	94	5	t	2025-10-25 11:53:56.358	2025-10-25 11:53:56.358
115	95	5	t	2025-10-25 11:53:56.361	2025-10-25 11:53:56.361
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, username, "passwordHash", role, "isActive", "isEmailVerified", "emailVerifyToken", "resetPasswordToken", "resetPasswordExpiry", avatar, bio, "totalPoints", "weeklyPoints", "monthlyPoints", "seasonPoints", "predictionAccuracy", "totalPredictions", "correctPredictions", "currentStreak", "bestStreak", rank, "lastLoginAt", "createdAt", "updatedAt") FROM stdin;
1	System	system@footballpredictions.com	system	N/A	SUPER_ADMIN	t	t	\N	\N	\N	\N	\N	0	0	0	0	0	0	0	0	0	\N	\N	2025-10-12 19:25:46.484	2025-10-12 19:41:33.295
3	yousef	yousef@example.com	yousef	$2b$10$1.zCqXAlqxuyCIJAll4hB.HnYvPF5umTcnD8.k5sDfrcfhhBaSa5y	ADMIN	t	f	\N	\N	\N	\N	\N	0	0	0	0	0	0	0	0	0	\N	2025-11-03 12:52:39.057	2025-10-12 19:37:47.331	2025-11-03 12:52:39.059
2	mustafa	mustafa@example.com	mustafa	$2b$10$.p4SzI5CV3oxrgAc7B6ORufjtnrKCptUUWLrgu1DeqGolnU8zSy6a	SUPER_ADMIN	t	f	\N	\N	\N	\N	\N	0	0	0	0	0	0	0	0	0	\N	2025-11-03 12:53:10.872	2025-10-12 19:35:35.185	2025-11-03 12:53:10.873
\.


--
-- Data for Name: UserAchievement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserAchievement" (id, "userId", "achievementId", "unlockedAt", progress) FROM stdin;
\.


--
-- Data for Name: UserFavoriteTeam; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserFavoriteTeam" (id, "userId", "teamId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1993eb28-a4ad-49a0-a826-f36286106d27	def9ec78a0e2e71fdc3add3f2f8009691db5dba300295917ed629a37665e4e7c	2025-10-06 20:06:48.18438+02	20251005191333_init	\N	\N	2025-10-06 20:06:48.077396+02	1
c20fdd7d-c29b-4ba6-912a-5b6edec642c0	cabca008bd21aab8d7fdd8ab0dc2cd3dbc3e1a06eff950454418947aa8bd4783	2025-10-06 20:06:48.21239+02	20251006092659_add_gameweek_tracking	\N	\N	2025-10-06 20:06:48.184853+02	1
2b1a8bf1-cc24-47e9-b32e-883b548cacb1	16666221a0faeadf57d4c5a75263826d0220a7ad17e1fcf97d2e81c16197a8f1	2025-10-06 20:43:43.510635+02	20251006184343_add_is_synced_to_match	\N	\N	2025-10-06 20:43:43.506553+02	1
\.


--
-- Name: Achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Achievement_id_seq"', 20, true);


--
-- Name: Analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Analytics_id_seq"', 31, true);


--
-- Name: AppSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AppSettings_id_seq"', 10, true);


--
-- Name: AuditLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AuditLog_id_seq"', 2, true);


--
-- Name: Badge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Badge_id_seq"', 1, false);


--
-- Name: GameWeekMatch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GameWeekMatch_id_seq"', 4926, true);


--
-- Name: GameWeek_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GameWeek_id_seq"', 157, true);


--
-- Name: GroupChangeRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GroupChangeRequest_id_seq"', 1, false);


--
-- Name: GroupMember_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GroupMember_id_seq"', 23, true);


--
-- Name: Group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Group_id_seq"', 11, true);


--
-- Name: League_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."League_id_seq"', 5, true);


--
-- Name: LoginHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LoginHistory_id_seq"', 44, true);


--
-- Name: Match_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Match_id_seq"', 1937, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 9, true);


--
-- Name: PointsRule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PointsRule_id_seq"', 17, true);


--
-- Name: Prediction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Prediction_id_seq"', 249, true);


--
-- Name: TableSnapshot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TableSnapshot_id_seq"', 1, false);


--
-- Name: Table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Table_id_seq"', 4232, true);


--
-- Name: TeamGameWeekStats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TeamGameWeekStats_id_seq"', 3058, true);


--
-- Name: TeamLeague_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TeamLeague_id_seq"', 115, true);


--
-- Name: Team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Team_id_seq"', 95, true);


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserAchievement_id_seq"', 17, true);


--
-- Name: UserFavoriteTeam_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserFavoriteTeam_id_seq"', 6, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 8, true);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: Analytics Analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Analytics"
    ADD CONSTRAINT "Analytics_pkey" PRIMARY KEY (id);


--
-- Name: AppSettings AppSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AppSettings"
    ADD CONSTRAINT "AppSettings_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: GameWeekMatch GameWeekMatch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeekMatch"
    ADD CONSTRAINT "GameWeekMatch_pkey" PRIMARY KEY (id);


--
-- Name: GameWeek GameWeek_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeek"
    ADD CONSTRAINT "GameWeek_pkey" PRIMARY KEY (id);


--
-- Name: GroupChangeRequest GroupChangeRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChangeRequest"
    ADD CONSTRAINT "GroupChangeRequest_pkey" PRIMARY KEY (id);


--
-- Name: GroupMember GroupMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupMember"
    ADD CONSTRAINT "GroupMember_pkey" PRIMARY KEY (id);


--
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- Name: League League_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."League"
    ADD CONSTRAINT "League_pkey" PRIMARY KEY (id);


--
-- Name: LoginHistory LoginHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginHistory"
    ADD CONSTRAINT "LoginHistory_pkey" PRIMARY KEY (id);


--
-- Name: Match Match_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PointsRule PointsRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PointsRule"
    ADD CONSTRAINT "PointsRule_pkey" PRIMARY KEY (id);


--
-- Name: Prediction Prediction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prediction"
    ADD CONSTRAINT "Prediction_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: TableSnapshot TableSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSnapshot"
    ADD CONSTRAINT "TableSnapshot_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: TeamGameWeekStats TeamGameWeekStats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamGameWeekStats"
    ADD CONSTRAINT "TeamGameWeekStats_pkey" PRIMARY KEY (id);


--
-- Name: TeamLeague TeamLeague_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamLeague"
    ADD CONSTRAINT "TeamLeague_pkey" PRIMARY KEY (id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- Name: UserAchievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: UserFavoriteTeam UserFavoriteTeam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavoriteTeam"
    ADD CONSTRAINT "UserFavoriteTeam_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Analytics_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Analytics_date_idx" ON public."Analytics" USING btree (date);


--
-- Name: Analytics_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Analytics_date_key" ON public."Analytics" USING btree (date);


--
-- Name: AppSettings_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AppSettings_key_idx" ON public."AppSettings" USING btree (key);


--
-- Name: AppSettings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AppSettings_key_key" ON public."AppSettings" USING btree (key);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: GameWeekMatch_gameWeekId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameWeekMatch_gameWeekId_idx" ON public."GameWeekMatch" USING btree ("gameWeekId");


--
-- Name: GameWeekMatch_gameWeekId_matchId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GameWeekMatch_gameWeekId_matchId_key" ON public."GameWeekMatch" USING btree ("gameWeekId", "matchId");


--
-- Name: GameWeekMatch_matchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameWeekMatch_matchId_idx" ON public."GameWeekMatch" USING btree ("matchId");


--
-- Name: GameWeek_isCurrent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameWeek_isCurrent_idx" ON public."GameWeek" USING btree ("isCurrent");


--
-- Name: GameWeek_leagueId_weekNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameWeek_leagueId_weekNumber_idx" ON public."GameWeek" USING btree ("leagueId", "weekNumber");


--
-- Name: GameWeek_leagueId_weekNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GameWeek_leagueId_weekNumber_key" ON public."GameWeek" USING btree ("leagueId", "weekNumber");


--
-- Name: GroupChangeRequest_groupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupChangeRequest_groupId_idx" ON public."GroupChangeRequest" USING btree ("groupId");


--
-- Name: GroupChangeRequest_requestedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupChangeRequest_requestedById_idx" ON public."GroupChangeRequest" USING btree ("requestedById");


--
-- Name: GroupChangeRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupChangeRequest_status_idx" ON public."GroupChangeRequest" USING btree (status);


--
-- Name: GroupMember_groupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupMember_groupId_idx" ON public."GroupMember" USING btree ("groupId");


--
-- Name: GroupMember_groupId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON public."GroupMember" USING btree ("groupId", "userId");


--
-- Name: GroupMember_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupMember_userId_idx" ON public."GroupMember" USING btree ("userId");


--
-- Name: Group_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Group_code_idx" ON public."Group" USING btree (code);


--
-- Name: Group_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Group_code_key" ON public."Group" USING btree (code);


--
-- Name: Group_isPublic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Group_isPublic_idx" ON public."Group" USING btree ("isPublic");


--
-- Name: Group_joinCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Group_joinCode_idx" ON public."Group" USING btree ("joinCode");


--
-- Name: Group_joinCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Group_joinCode_key" ON public."Group" USING btree ("joinCode");


--
-- Name: Group_leagueId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Group_leagueId_idx" ON public."Group" USING btree ("leagueId");


--
-- Name: League_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "League_code_key" ON public."League" USING btree (code);


--
-- Name: League_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "League_isActive_idx" ON public."League" USING btree ("isActive");


--
-- Name: League_name_season_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "League_name_season_key" ON public."League" USING btree (name, season);


--
-- Name: League_season_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "League_season_idx" ON public."League" USING btree (season);


--
-- Name: LoginHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LoginHistory_createdAt_idx" ON public."LoginHistory" USING btree ("createdAt");


--
-- Name: LoginHistory_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LoginHistory_userId_idx" ON public."LoginHistory" USING btree ("userId");


--
-- Name: Match_homeTeamId_awayTeamId_matchDate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Match_homeTeamId_awayTeamId_matchDate_key" ON public."Match" USING btree ("homeTeamId", "awayTeamId", "matchDate");


--
-- Name: Match_leagueId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Match_leagueId_idx" ON public."Match" USING btree ("leagueId");


--
-- Name: Match_matchDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Match_matchDate_idx" ON public."Match" USING btree ("matchDate");


--
-- Name: Match_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Match_status_idx" ON public."Match" USING btree (status);


--
-- Name: Match_weekNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Match_weekNumber_idx" ON public."Match" USING btree ("weekNumber");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: PointsRule_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PointsRule_isActive_idx" ON public."PointsRule" USING btree ("isActive");


--
-- Name: Prediction_isProcessed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prediction_isProcessed_idx" ON public."Prediction" USING btree ("isProcessed");


--
-- Name: Prediction_matchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prediction_matchId_idx" ON public."Prediction" USING btree ("matchId");


--
-- Name: Prediction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prediction_userId_idx" ON public."Prediction" USING btree ("userId");


--
-- Name: Prediction_userId_matchId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Prediction_userId_matchId_key" ON public."Prediction" USING btree ("userId", "matchId");


--
-- Name: Session_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_token_idx" ON public."Session" USING btree (token);


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: TableSnapshot_gameWeekId_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TableSnapshot_gameWeekId_position_idx" ON public."TableSnapshot" USING btree ("gameWeekId", "position");


--
-- Name: TableSnapshot_gameWeekId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TableSnapshot_gameWeekId_teamId_key" ON public."TableSnapshot" USING btree ("gameWeekId", "teamId");


--
-- Name: TableSnapshot_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TableSnapshot_teamId_idx" ON public."TableSnapshot" USING btree ("teamId");


--
-- Name: Table_leagueId_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Table_leagueId_position_idx" ON public."Table" USING btree ("leagueId", "position");


--
-- Name: Table_leagueId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Table_leagueId_teamId_key" ON public."Table" USING btree ("leagueId", "teamId");


--
-- Name: TeamGameWeekStats_gameWeekId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamGameWeekStats_gameWeekId_idx" ON public."TeamGameWeekStats" USING btree ("gameWeekId");


--
-- Name: TeamGameWeekStats_gameWeekId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TeamGameWeekStats_gameWeekId_teamId_key" ON public."TeamGameWeekStats" USING btree ("gameWeekId", "teamId");


--
-- Name: TeamGameWeekStats_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamGameWeekStats_teamId_idx" ON public."TeamGameWeekStats" USING btree ("teamId");


--
-- Name: TeamLeague_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamLeague_isActive_idx" ON public."TeamLeague" USING btree ("isActive");


--
-- Name: TeamLeague_leagueId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamLeague_leagueId_idx" ON public."TeamLeague" USING btree ("leagueId");


--
-- Name: TeamLeague_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeamLeague_teamId_idx" ON public."TeamLeague" USING btree ("teamId");


--
-- Name: TeamLeague_teamId_leagueId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TeamLeague_teamId_leagueId_key" ON public."TeamLeague" USING btree ("teamId", "leagueId");


--
-- Name: Team_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Team_code_idx" ON public."Team" USING btree (code);


--
-- Name: Team_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Team_code_key" ON public."Team" USING btree (code);


--
-- Name: UserAchievement_userId_achievementId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON public."UserAchievement" USING btree ("userId", "achievementId");


--
-- Name: UserAchievement_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserAchievement_userId_idx" ON public."UserAchievement" USING btree ("userId");


--
-- Name: UserFavoriteTeam_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserFavoriteTeam_teamId_idx" ON public."UserFavoriteTeam" USING btree ("teamId");


--
-- Name: UserFavoriteTeam_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserFavoriteTeam_userId_idx" ON public."UserFavoriteTeam" USING btree ("userId");


--
-- Name: UserFavoriteTeam_userId_teamId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserFavoriteTeam_userId_teamId_key" ON public."UserFavoriteTeam" USING btree ("userId", "teamId");


--
-- Name: User_emailVerifyToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_emailVerifyToken_key" ON public."User" USING btree ("emailVerifyToken");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_rank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_rank_idx" ON public."User" USING btree (rank);


--
-- Name: User_resetPasswordToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON public."User" USING btree ("resetPasswordToken");


--
-- Name: User_totalPoints_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_totalPoints_idx" ON public."User" USING btree ("totalPoints");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: GameWeekMatch GameWeekMatch_gameWeekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeekMatch"
    ADD CONSTRAINT "GameWeekMatch_gameWeekId_fkey" FOREIGN KEY ("gameWeekId") REFERENCES public."GameWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameWeekMatch GameWeekMatch_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeekMatch"
    ADD CONSTRAINT "GameWeekMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public."Match"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameWeek GameWeek_leagueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameWeek"
    ADD CONSTRAINT "GameWeek_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES public."League"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroupChangeRequest GroupChangeRequest_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChangeRequest"
    ADD CONSTRAINT "GroupChangeRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GroupChangeRequest GroupChangeRequest_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChangeRequest"
    ADD CONSTRAINT "GroupChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GroupMember GroupMember_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupMember"
    ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GroupMember GroupMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupMember"
    ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Group Group_leagueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES public."League"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Group Group_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoginHistory LoginHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginHistory"
    ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Match Match_awayTeamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Match Match_homeTeamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Match Match_leagueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES public."League"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prediction Prediction_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prediction"
    ADD CONSTRAINT "Prediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public."Match"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prediction Prediction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prediction"
    ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TableSnapshot TableSnapshot_gameWeekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSnapshot"
    ADD CONSTRAINT "TableSnapshot_gameWeekId_fkey" FOREIGN KEY ("gameWeekId") REFERENCES public."GameWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TableSnapshot TableSnapshot_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSnapshot"
    ADD CONSTRAINT "TableSnapshot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_leagueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES public."League"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_nextOpponentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_nextOpponentId_fkey" FOREIGN KEY ("nextOpponentId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Table Table_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeamGameWeekStats TeamGameWeekStats_gameWeekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamGameWeekStats"
    ADD CONSTRAINT "TeamGameWeekStats_gameWeekId_fkey" FOREIGN KEY ("gameWeekId") REFERENCES public."GameWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeamGameWeekStats TeamGameWeekStats_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamGameWeekStats"
    ADD CONSTRAINT "TeamGameWeekStats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeamLeague TeamLeague_leagueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamLeague"
    ADD CONSTRAINT "TeamLeague_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES public."League"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeamLeague TeamLeague_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamLeague"
    ADD CONSTRAINT "TeamLeague_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserAchievement UserAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public."Achievement"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserAchievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserFavoriteTeam UserFavoriteTeam_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavoriteTeam"
    ADD CONSTRAINT "UserFavoriteTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserFavoriteTeam UserFavoriteTeam_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavoriteTeam"
    ADD CONSTRAINT "UserFavoriteTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Deb00waOvhm2lcbHKKDyaA3YWCQc2eEOhlXdxG1bXiNPP0PvYhMCnia8KncPID6

