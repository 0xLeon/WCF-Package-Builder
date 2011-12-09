<?php
/**
 * @author	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.leon.wcf.packageBuilder
 */
// set exception handler
set_exception_handler(array('packageBuilder\PackageBuilder', 'handleException'));

// set error handler
set_error_handler(array('packageBuilder\PackageBuilder', 'handleError'), E_ALL);

// set autoload function
spl_autoload_register(array('packageBuilder\PackageBuilder', 'autoload'));
