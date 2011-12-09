<?php
namespace packageBuilder\exception;

/**
 * XMLException handles all xml related errors.
 * 
 * @author	Stefan Hahn
 * @copyright	2011 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.leon.wcf.packageBuilder
 * @subpackage	exception
 */
class XMLException extends \Exception implements IPrintableException, IRecoverableException {
	protected $level = LIBXML_ERR_NONE;
	protected $xmlFile = '';
	protected $xmlLine = 0;
	protected $xmlColumn = 0;
	
	/**
	 * Created a new XMLException object.
	 * 
	 * @param	mixed
	 */
	public function __construct($message = '', $code = 0, $level = LIBXML_ERR_NONE, $xmlFile = '', $xmlLine = 0, $xmlColumn = 0) {
		$this->level = $level;
		$this->xmlFile = $file;
		$this->xmlLine = $line;
		$this->xmlColumn = $column;
		
		parent::__construct($message, $code);
	}
	
	public function getLevel() {
		return $this->level;
	}
	
	public function getXmlFile() {
		return $this->xmlFile;
	}
	
	public function getXmlLine() {
		return $this->xmlLine;
	}
	
	public function getXmlColumn() {
		return $this->xmlColumn;
	}
	
	/**
	 * @see		\packageBuilder\exception\IPrintableException
	 */
	public function show() {
		
	}
}
