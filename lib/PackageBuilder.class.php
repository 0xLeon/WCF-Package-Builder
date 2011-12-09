<?php
namespace packageBuilder;

require_once(APP_DIR.'lib/core.functions.php');

define('PACKAGE_BUILDER_VERSION', '1.0.0dev');

libxml_use_internal_errors(true);

/**
 * PackageBuilder is the central class of the package builder app.
 *
 * @author 	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.packageBuilder
 */
final class PackageBuilder {
	/**
	 * Includes the required classes automatically.
	 *
	 * @param 	string		$className
	 * @see		spl_autoload_register()
	 */
	public static function autoload($className) {
		$namespaces = explode('\\', $className);
		if (count($namespaces) > 1) {
			array_shift($namespaces);
			$classPath = APP_DIR . 'lib/' . implode('/', $namespaces) . '.class.php';
			if (file_exists($classPath)) {
				require_once($classPath);
			}
		}
	}
	
	/**
	 * Calls the show method on the given exception.
	 *
	 * @param	\Exception	$e
	 */
	public static function handleException(\Exception $e) {
		if ($e instanceof exception\IPrintableException) {
			$e->show();
			
		}
		else {
			print $e;
		}
		
		if (!($e instanceof exception\IRecoverableException)) {
			exit;
		}
	}
	
	/**
	 * Catches php errors and throws instead a system exception.
	 *
	 * @param	integer		$errorNo
	 * @param	string		$message
	 * @param	string		$filename
	 * @param	integer		$lineNo
	 */
	public static function handleError($errorNo, $message, $filename, $lineNo) {
		if (error_reporting() != 0) {
			$type = 'error';
			switch ($errorNo) {
				case 2: $type = 'warning';
					break;
				case 8: $type = 'notice';
					break;
			}
			
			throw new exception\SystemException('PHP '.$type.' in file '.$filename.' ('.$lineNo.'): '.$message, 0);
		}
	}
}
