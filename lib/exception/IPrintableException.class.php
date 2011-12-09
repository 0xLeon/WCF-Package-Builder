<?php
namespace packageBuilder\exception;

/**
 * All exceptions implementing this interface are shown to the user by the exception handler.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2011 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.leon.wcf.packageBuilder
 * @subpackage	exception
 */
interface IPrintableException {
	/**
	 * Prints this exception.
	 * This method is called by the exception handler.
	 */
	public function show();
}
