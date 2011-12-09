<?php
namespace packageBuilder\exception;
use packageBuilder\PackageBuilder

/**
 * A SystemException is thrown when an unexpected error occurs.
 *
 * @author	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf
 * @subpackage	exception
 */
class SystemException extends LoggedException implements IPrintableException {
	/**
	 * error description
	 * @var string
	 */
	protected $description = '';
	
	/**
	 * Returns the description of this exception.
	 *
	 * @return 	string
	 */
	public function getDescription() {
		return $this->description;
	}
	
	/**
	 * @see packageBuilder\exception\IPrintableException::show()
	 */
	public function show() {
		$this->logError();
		
		echo 'Fatal error: ', $this->getMessage(), PHP_EOL;
		echo 'Stacktrace: ', PHP_EOL;
		echo $this->getTraceAsString();
	}
}
