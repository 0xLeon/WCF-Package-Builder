<?php
namespace packageBuilder\exception;
use packageBuilder\PackageBuilder;

/**
 * A logged exceptions  provides an easy way to log errors.
 *
 * @author	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.packageBuilder
 * @subpackage	exception
 */
class LoggedException extends \Exception {
	/**
	 * Writes an error to log file.
	 */
	protected function logError() {
		$logFile = PackageBuilder::getExecDir().'log/error ('.date('Y-m-d', time()).').log';
		
		// try to create file
		@touch($logFile);
		
		// validate if file exists and is accessible for us
		if (!file_exists($logFile) || !is_writable($logFile)) {
			// We cannot recover if we reached this point, the user
			// is urged to fix his pretty much broken configuration.
			// 
			// GLaDOS: Look at you, sailing through the air majestically, like an eagle... piloting a blimp.
			
			return;
		}
		
		// build message
		$message = date('r', time()) . "\n" . $this->getMessage() . "\n\n" . $this->getTraceAsString() . "\n\n\n";
		
		// append
		@file_put_contents($logFile, $message, FILE_APPEND);
	}
}