--
-- Database: `dhanadhanoffers`
--

-- --------------------------------------------------------

--
-- Table structure for table `business`
--

CREATE TABLE `business` (
  `businessId` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `businessName` varchar(100) NOT NULL,
  `businessTagLine` varchar(200) NOT NULL,
  `businessAddress1` varchar(100) NOT NULL,
  `businessAddress2` varchar(100) NOT NULL,
  `businessCategories` varchar(500) NOT NULL,
  `businessCity` varchar(50) NOT NULL,
  `businessState` varchar(50) NOT NULL,
  `businessHaveMultipleLocation` varchar(3) NOT NULL,
  `businessNoOfLocations` int(11) NOT NULL,
  `businessLogo` varchar(50) NOT NULL,
  `businessCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB ;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `categoryId` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `categoryName` varchar(50) NOT NULL,
  `categoryImage` varchar(100) NOT NULL,
  `categoryStatus` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB ;

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `dealId` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `dealCategory` varchar(50) NOT NULL,
  `dealSubcategory` varchar(50) NOT NULL,
  `dealStore` varchar(100) NOT NULL,
  `dealStoreAddress` varchar(200) NOT NULL,
  `dealCity` varchar(60) NOT NULL,
  `dealState` varchar(60) NOT NULL,
  `dealOffer` varchar(200) NOT NULL,
  `dealInstructions` text NOT NULL,
  `dealDisclaimer` text NOT NULL,
  `dealColor` varchar(20) NOT NULL,
  `dealDisplay` tinyint(4) NOT NULL,
  `dealMain` tinyint(4) NOT NULL,
  `dealCreatedBy` int(11) NOT NULL,
  `dealCreatedDate` date NOT NULL,
  `dealLink` varchar(200) NOT NULL
) ENGINE=InnoDB;

------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL UNIQUE KEY,
  `alt_phone` varchar(20) NOT NULL,
  `user_role` tinyint(4) NOT NULL DEFAULT '2',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `agreeTerms` text NOT NULL,
  `name` varchar(60) NOT NULL
) ENGINE=InnoDB ;


CREATE TABLE `products` (
  `productId` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `productCategory` varchar(50) NOT NULL,
  `productSubcategory` varchar(50) NOT NULL,
  `productName` varchar(500) NOT NULL,
  `productSku` varchar(50) NOT NULL,
  `productPrice` decimal(10,2) NOT NULL,
  `productSellingPrice` decimal(10,2) NOT NULL,
  `productSalePrice` decimal(10,2) NOT NULL,
  `productDisplay` tinyint(4) NOT NULL,
  `productMain` tinyint(4) NOT NULL,
  `productCreatedBy` int(11) NOT NULL,
  `productImage` varchar(50) NOT NULL,
  `productDescription` text NOT NULL
) ENGINE=InnoDB