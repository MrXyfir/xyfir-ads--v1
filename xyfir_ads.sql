SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `ads` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(25) NOT NULL COMMENT 'Campaign name',
  `funds` decimal(14,6) NOT NULL COMMENT 'Funds available to campaign',
  `daily_funds` decimal(12,6) NOT NULL COMMENT 'Maximum amount of funds to be removed from funds daily',
  `daily_funds_used` decimal(12,6) NOT NULL COMMENT 'Funds used during current day',
  `pay_type` tinyint(4) NOT NULL COMMENT 'Determines ad''s payment type (cpc, cpv, etc)',
  `pay_modifier` int(10) UNSIGNED NOT NULL,
  `cost` decimal(7,6) NOT NULL COMMENT 'Cost per pay_type (cpc, cpv, etc)',
  `autobid` tinyint(1) NOT NULL,
  `requested` int(11) UNSIGNED NOT NULL COMMENT 'Clicks / views / etc buyer requests',
  `provided` int(11) UNSIGNED NOT NULL COMMENT 'Clicks / views / etc provided',
  `available` varchar(219) NOT NULL COMMENT 'Time ranges of when to serve the ad',
  `approved` tinyint(1) NOT NULL COMMENT 'Only return approved ads to publishers',
  `ad_type` tinyint(4) NOT NULL COMMENT 'Ad type (text, image, etc)',
  `ad_title` varchar(25) NOT NULL,
  `ad_description` varchar(150) NOT NULL,
  `ad_link` varchar(100) NOT NULL COMMENT 'Where we''ll redirect the user on click',
  `ad_media` varchar(450) NOT NULL COMMENT 'Ad''s image or video sources',
  `ut_age` varchar(9) NOT NULL COMMENT 'Targeted user age ranges',
  `ut_countries` varchar(149) NOT NULL COMMENT 'Targeted user countries',
  `ut_regions` varchar(1000) NOT NULL COMMENT 'Targeted country regions',
  `ut_genders` varchar(3) NOT NULL COMMENT 'Targeted user genders',
  `ct_categories` varchar(100) NOT NULL COMMENT 'Target categories and subcategories',
  `ct_keywords` varchar(1500) NOT NULL COMMENT 'Target keywords and phrases',
  `ct_sites` varchar(225) NOT NULL COMMENT 'Target websites in our publisher network',
  `owner` int(11) UNSIGNED NOT NULL COMMENT 'Owner''s user id',
  `ended` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ads_blacklisted` (
  `pub_id` int(10) UNSIGNED NOT NULL,
  `ad_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `advertisers` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `funds` decimal(12,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ad_reports` (
  `id` int(11) UNSIGNED NOT NULL COMMENT 'Ad campaign id',
  `day` date NOT NULL,
  `clicks` int(11) UNSIGNED NOT NULL,
  `views` int(11) UNSIGNED NOT NULL,
  `cost` decimal(12,6) NOT NULL,
  `dem_age` varchar(70) NOT NULL,
  `dem_gender` varchar(40) NOT NULL,
  `dem_geo` varchar(10000) NOT NULL,
  `publishers` varchar(10000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `awaiting_publishers` (
  `user_id` int(11) UNSIGNED NOT NULL COMMENT 'Awaiting publisher''s user id',
  `name` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `application` varchar(1500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `clicks` (
  `ad_id` int(11) UNSIGNED NOT NULL,
  `pub_id` int(11) UNSIGNED NOT NULL,
  `xad_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `ip` varchar(45) NOT NULL,
  `clicked` int(11) UNSIGNED NOT NULL,
  `served` int(11) UNSIGNED NOT NULL,
  `signature` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `cost` decimal(7,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `payments` (
  `id` varchar(28) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `received` tinyint(1) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tstamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `publishers` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `payment_method` tinyint(4) NOT NULL,
  `payment_info` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `pubs` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(25) NOT NULL COMMENT 'Campaign name as set by publisher',
  `categories` varchar(300) NOT NULL COMMENT 'Main and sub categories for content',
  `keywords` varchar(1599) NOT NULL COMMENT 'Comma delimited list of keywords / phrases',
  `site` varchar(75) NOT NULL COMMENT 'Website for pub campaign',
  `type` tinyint(4) NOT NULL COMMENT 'Website / App / etc',
  `owner` int(11) UNSIGNED NOT NULL COMMENT 'Pub campaign''s owner''s user_id',
  `test` varchar(10) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `pub_reports` (
  `id` int(11) UNSIGNED NOT NULL COMMENT 'Pub campaign',
  `day` date NOT NULL,
  `clicks` int(11) UNSIGNED NOT NULL,
  `views` int(11) UNSIGNED NOT NULL,
  `earnings` decimal(14,6) NOT NULL,
  `earnings_temp` decimal(14,6) NOT NULL,
  `ads` varchar(10000) NOT NULL COMMENT 'ad_id:clicks,ad_id:clicks'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text COLLATE utf8_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `users` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `xid` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `publisher` tinyint(1) NOT NULL,
  `advertiser` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `xad_ids` (
  `xad_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `info` varchar(800) NOT NULL,
  `xacc_uid` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ads_owner` (`owner`);

ALTER TABLE `ads_blacklisted`
  ADD UNIQUE KEY `pub_id` (`pub_id`,`ad_id`),
  ADD KEY `fk_blacklisted_ads_ad` (`ad_id`);

ALTER TABLE `advertisers`
  ADD KEY `fk_advertisers_user_id` (`user_id`);

ALTER TABLE `ad_reports`
  ADD KEY `fk_ad_reports_id` (`id`);

ALTER TABLE `awaiting_publishers`
  ADD PRIMARY KEY (`user_id`);

ALTER TABLE `clicks`
  ADD KEY `fk_clicks_ad_id` (`ad_id`),
  ADD KEY `fk_clicks_pub_id` (`pub_id`);

ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payments_user_id` (`user_id`);

ALTER TABLE `publishers`
  ADD KEY `fk_publishers_user_id` (`user_id`);

ALTER TABLE `pubs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pubs_owner` (`owner`);

ALTER TABLE `pub_reports`
  ADD KEY `fk_pub_reports_id` (`id`);

ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

ALTER TABLE `xad_ids`
  ADD PRIMARY KEY (`xad_id`),
  ADD UNIQUE KEY `xad_id` (`xad_id`);


ALTER TABLE `ads`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
ALTER TABLE `pubs`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `users`
  MODIFY `user_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `ads`
  ADD CONSTRAINT `fk_ads_owner` FOREIGN KEY (`owner`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `ads_blacklisted`
  ADD CONSTRAINT `fk_blacklisted_ads_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_blacklisted_ads_pub` FOREIGN KEY (`pub_id`) REFERENCES `pubs` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `advertisers`
  ADD CONSTRAINT `fk_advertisers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `ad_reports`
  ADD CONSTRAINT `fk_ad_reports_id` FOREIGN KEY (`id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `awaiting_publishers`
  ADD CONSTRAINT `fk_awaiting_publishers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `clicks`
  ADD CONSTRAINT `fk_clicks_ad_id` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_clicks_pub_id` FOREIGN KEY (`pub_id`) REFERENCES `pubs` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `publishers`
  ADD CONSTRAINT `fk_publishers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `pubs`
  ADD CONSTRAINT `fk_pubs_owner` FOREIGN KEY (`owner`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `pub_reports`
  ADD CONSTRAINT `fk_pub_reports_id` FOREIGN KEY (`id`) REFERENCES `pubs` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
