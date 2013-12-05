//
//  RMBaseViewController.h
//  Rediscovr
//
//  Created by Brennan Stehling on 12/4/13.
//  Copyright (c) 2013 Rediscovr. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "UIViewController+Base.h"

@interface RMBaseViewController : UIViewController

#pragma mark - Keyboard Methods
#pragma mark -

- (void)hideKeyboardWithoutAnimation;
- (void)keyboardWillShowWithHeight:(CGFloat)height duration:(CGFloat)duration animationOptions:(UIViewAnimationOptions)animationOptions;
- (void)keyboardWillHideWithHeight:(CGFloat)height duration:(CGFloat)duration animationOptions:(UIViewAnimationOptions)animationOptions;
- (void)keyboardDidShow;
- (void)keyboardDidHide;

#pragma mark - Embedding Views
#pragma mark -

- (void)sizeView:(UIView *)view inScrollView:(UIScrollView *)scrollview withSize:(CGSize)size;
- (void)embedViewController:(UIViewController *)vc intoView:(UIView *)superview;
- (void)embedViewController:(UIViewController *)vc intoScrollView:(UIScrollView *)scrollview withContentSize:(CGSize)contentSize;
- (void)removeEmbeddedViewController:(UIViewController *)vc;

#pragma mark - Contraints
#pragma mark -

- (void)logConstraints:(NSArray *)constraints;
- (void)logConstraint:(NSLayoutConstraint *)constraint;
- (void)fillSubview:(UIView *)subview inSuperView:(UIView *)superview;
- (NSLayoutConstraint *)getTopConstraint:(UIView *)view;
- (NSLayoutConstraint *)getBottomConstraint:(UIView *)view;
- (NSLayoutConstraint *)getHeightConstraint:(UIView *)view;
- (NSLayoutConstraint *)getConstraintInView:(UIView *)view forLayoutAttribute:(NSLayoutAttribute)layoutAttribute;
- (NSString *)nameForConstraintAttribute:(NSLayoutAttribute)attribute;

@end
