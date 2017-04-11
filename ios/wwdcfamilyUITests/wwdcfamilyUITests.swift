//
//  wwdcfamilyUITests.swift
//  wwdcfamilyUITests
//
//  Created by Felix Krause on 4/10/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import XCTest

class wwdcfamilyUITests: XCTestCase {
  
  override func setUp() {
    super.setUp()
    // In UI tests it is usually best to stop immediately when a failure occurs.
    continueAfterFailure = false
    // UI tests must launch the application that they test. Doing this in setup will make sure it happens for each test method.
    let app = XCUIApplication()
    setupSnapshot(app)
    app.launch()
  }
  
  override func tearDown() {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    super.tearDown()
  }
  
  func testAppForScreenshots() {
    let app = XCUIApplication()
    snapshot("0_Login")
    app.textFields["Email"].tap()
    app.textFields["Email"].typeText("simulator@krausefx.com")
    app.secureTextFields["Password"].tap()
    app.secureTextFields["Password"].typeText("simulatorPassword033")
    app.buttons["Login"].tap()

    sleep(6) // to ensure the map and all markers are loaded
    snapshot("1_Map")
    
    app.staticTexts["📡"].tap()
    
    snapshot("3_Dialog")
  }
}
