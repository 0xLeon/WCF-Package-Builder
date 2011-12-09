<?php
namespace packageBuilder\xml;
use packageBuilder\exception;

class XMLParser {
	const NS_SCHEMA_INSTANCE = 'http://www.w3.org/2001/XMLSchema-instance';
	const NS_WOLTLAB = 'http://www.woltlab.com';
	protected $dom = null;
	
	public function __construct($file = '') {
		$this->dom = new DOMDocument('1.0', 'uft-8');
		
		if ($file !== '') {
			$this->load($file);
		}
	}
	
	public function load($file) {
		$this->dom->load($file);
		
		$errors = libxml_get_errors();
		libxml_clear_errors(); 
		
		if (!empty($errors) && $errors[0]->level == LIBXML_ERR_FATAL) {
			foreach ($errors as $error) {
				throw new XMLException($error);
			}
		}
	}
	
	public function validate() {
		if ($this->dom->doctype === null) {
			$xsiSchemaLocation = preg_split('/\s+/', $dom->documentElement->getAttributeNS(self::NS_SCHEMA_INSTANCE, 'schemaLocation'));
			
			if (count($xsiSchemaLocation) > 0) {
				$ns = $dom->documentElement->getAttribute('xmlns');
				
				if ($ns !== '') {
					if (count($xsiSchemaLocation) === 2) {
						if ($xsiSchemaLocation[0] === $ns) {
							$this->dom->schemaValidate($xsiSchemaLocation[1]);
							$this->checkErrors();
						}
						else {
							throw new XMLException('Namespace in schemaLocation tag doesn\'t match document default namespace');
						}
					}
					else {
						throw new XMLException('Invalid value assigned to schemaLocation attribute');
					}
				}
				else {
					throw new XMLException('schemaLocation tag used but no namespace given');
				}
			}
			
			$xsiNoNamespaceSchemaLocation = $dom->documentElement->getAttributeNS(self::NS_SCHEMA_INSTANCE, 'noNamespaceSchemaLocation');
			
			if (strlen($xsiNoNamespaceSchemaLocation) > 0) {
				$this->dom->schemaValidate($xsiNoNamespaceSchemaLocation);
				$this->checkErrors();
			}
			
			throw new XMLException('Could not find any DTD or schema');
		}
		else {
			$this->dom->validate();
			$this->checkErrors();
		}
	}
	
	protected function checkErrors() {
		$errors = libxml_get_errors();
		libxml_clear_errors();

		if (count($errors) > 0) {
			foreach ($errors as $error) {
				throw new XMLException($error);
			}
		}
	}
}
