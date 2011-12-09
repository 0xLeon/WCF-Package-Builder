<?php
/**
 * @author	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.packageBuilder
 */
// define the package builder root dir
define('APP_DIR', dirname(__FILE__).'/');

// initiate package builder core
require_once(APP_DIR.'lib/PackageBuilder.class.php');
new packageBuilder\PackageBuilder();
