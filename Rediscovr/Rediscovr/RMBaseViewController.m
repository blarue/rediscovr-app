//
//  RMBaseViewController.m
//  Rediscovr
//
//  Created by Brennan Stehling on 12/4/13.
//  Copyright (c) 2013 Rediscovr. All rights reserved.
//

#import "RMBaseViewController.h"

@interface RMBaseViewController () <UIGestureRecognizerDelegate>

@property (weak, nonatomic) UITapGestureRecognizer *mainTapGestureRecognizer;

@end

@implementation RMBaseViewController {
    BOOL isKeyboardVisible;
}

#pragma mark - View Lifecycle
#pragma mark -

- (void)viewDidLoad {
    DebugLog(@"%@", NSStringFromSelector(_cmd));
    
    [super viewDidLoad];
    
    [self.view endEditing:TRUE];
    isKeyboardVisible = FALSE;
    self.navigationController.navigationBar.barStyle = UIBarStyleBlack;
    
    UITapGestureRecognizer *mainTapGestureRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(mainTapGestureRecognized:)];
    mainTapGestureRecognizer.delegate = self;
    self.view.gestureRecognizers = @[mainTapGestureRecognizer];
    self.mainTapGestureRecognizer = mainTapGestureRecognizer;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillShowNotification:)
                                                 name:UIKeyboardWillShowNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillHideNotification:)
                                                 name:UIKeyboardWillHideNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardDidShowNotification:)
                                                 name:UIKeyboardDidShowNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardDidHideNotification:)
                                                 name:UIKeyboardDidHideNotification
                                               object:nil];
    
    self.navigationController.navigationBar.backgroundColor = self.view.backgroundColor;
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:UIKeyboardWillShowNotification
                                                  object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:UIKeyboardWillHideNotification
                                                  object:nil];
    
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:UIKeyboardDidShowNotification
                                                  object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:UIKeyboardDidHideNotification
                                                  object:nil];
}

#pragma mark - Keyboard Methods
#pragma mark -

- (void)hideKeyboardWithoutAnimation {
    [self keyboardWillHideWithHeight:0.0 duration:0.0 animationOptions:kNilOptions];
}

- (void)keyboardWillShowWithHeight:(CGFloat)height duration:(CGFloat)duration animationOptions:(UIViewAnimationOptions)animationOptions {
    // override if necessary
    
    DebugLog(@"%@", NSStringFromSelector(_cmd));
    
    UIScrollView *scrollView = [self mainScrollView];
    if (scrollView) {
        CGFloat bottom = 0;
        if (isiOS7OrLater) {
            bottom = self.bottomLayoutGuide.length;
        }
        
        UIEdgeInsets contentInset = scrollView.contentInset;
        contentInset.bottom = bottom + height;
        
        UIEdgeInsets scrollIndicatorInsets = scrollView.scrollIndicatorInsets;
        scrollIndicatorInsets.bottom = contentInset.bottom;
        
        [UIView animateWithDuration:duration delay:0.0 options:animationOptions animations:^{
            scrollView.contentInset = contentInset;
            scrollView.scrollIndicatorInsets = scrollIndicatorInsets;
        } completion:^(BOOL finished) {
        }];
    }
}

- (void)keyboardWillHideWithHeight:(CGFloat)height duration:(CGFloat)duration animationOptions:(UIViewAnimationOptions)animationOptions {
    // override if necessary

    DebugLog(@"%@", NSStringFromSelector(_cmd));
    
    UIScrollView *scrollView = [self mainScrollView];
    if (scrollView) {
    
        CGFloat bottom = 0;
        if (isiOS7OrLater) {
            bottom = self.bottomLayoutGuide.length;
        }
        
        UIEdgeInsets contentInset = scrollView.contentInset;
        contentInset.bottom = bottom;
        
        UIEdgeInsets scrollIndicatorInsets = scrollView.scrollIndicatorInsets;
        scrollIndicatorInsets.bottom = contentInset.bottom;
        
        [UIView animateWithDuration:duration delay:0.0 options:animationOptions animations:^{
            scrollView.contentInset = contentInset;
            scrollView.scrollIndicatorInsets = scrollIndicatorInsets;
        } completion:^(BOOL finished) {
        }];
    }
}

- (void)keyboardDidShow {
    // override if necessary
}

- (void)keyboardDidHide {
    // override if necessary
}

#pragma mark - Embedding Views
#pragma mark -

- (void)sizeView:(UIView *)view inScrollView:(UIScrollView *)scrollview withSize:(CGSize)size {
    DebugLog(@"%@", NSStringFromSelector(_cmd));
    LOG_SIZE(@"size", size);
    NSLayoutConstraint *widthConstraint = [NSLayoutConstraint constraintWithItem:view attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual
                                                                          toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0 constant:size.width];
    
    NSLayoutConstraint *heightConstraint = [NSLayoutConstraint constraintWithItem:view attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual
                                                                           toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0 constant:size.height];
    
    
    // add a negative bottom constraint between view and scroll view
    
    NSLayoutConstraint *bottomConstraint = [NSLayoutConstraint constraintWithItem:view attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual
                                                                           toItem:scrollview attribute:NSLayoutAttributeBottom multiplier:1.0 constant:-800];
    
    [view addConstraints:@[widthConstraint, heightConstraint, bottomConstraint]];
    
    [view setNeedsLayout];
    [view layoutIfNeeded];
}

- (void)embedViewController:(UIViewController *)vc intoView:(UIView *)superview {
    MAAssert(vc, @"VC must be define");
    MAAssert(superview, @"Superview must be defined");
    
    UIView *view = vc.view;
    
    view.translatesAutoresizingMaskIntoConstraints = NO;
    [self addChildViewController:vc];
    [superview addSubview:view];
    [self fillSubview:vc.view inSuperView:superview];
    
    [self didMoveToParentViewController:self];
    
    [vc didMoveToParentViewController:self];
}

- (void)embedViewController:(UIViewController *)vc intoScrollView:(UIScrollView *)scrollview withContentSize:(CGSize)contentSize {
    MAAssert(vc, @"VC must be define");
    MAAssert(scrollview, @"Scroll View must be defined");
    
    LOG_SIZE(@"content size", contentSize);
    
    if ([vc respondsToSelector:@selector(setDelegate:)]) {
        [vc performSelector:@selector(setDelegate:) withObject:self];
    }
    
    vc.view.translatesAutoresizingMaskIntoConstraints = NO;
    
    [self addChildViewController:vc];
    [scrollview addSubview:vc.view];
    [self sizeView:vc.view inScrollView:scrollview withSize:contentSize];
    
    [vc didMoveToParentViewController:self];
}

- (void)removeEmbeddedViewController:(UIViewController *)vc {
    if (vc) {
        [vc willMoveToParentViewController:nil];
        [vc.view removeFromSuperview];
        [vc removeFromParentViewController];
    }
}

#pragma mark - Contraints
#pragma mark -

- (void)logConstraints:(NSArray *)constraints {
    for (NSLayoutConstraint *constraint in constraints) {
        [self logConstraint:constraint];
    }
}

- (void)logConstraint:(NSLayoutConstraint *)constraint {
    DebugLog(@"%@/%@/%li , %@/%@/%li : (%f, %f)",
             NSStringFromClass([constraint.firstItem class]),
             [self nameForConstraintAttribute:constraint.firstAttribute],
             (long)(constraint.firstItem ? ((UIView *)constraint.firstItem).tag : 0),
             NSStringFromClass([constraint.secondItem class]),
             [self nameForConstraintAttribute:constraint.secondAttribute],
             (long)(constraint.secondItem ? ((UIView *)constraint.secondItem).tag : 0),
             constraint.priority,
             constraint.constant);
}

- (void)fillSubview:(UIView *)subview inSuperView:(UIView *)superview {
    NSDictionary *views = NSDictionaryOfVariableBindings(subview);
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|[subview]|" options:0 metrics:nil views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|[subview]|" options:0 metrics:nil views:views]];
}

- (NSLayoutConstraint *)getTopConstraint:(UIView *)view {
    return [self getConstraintInView:view forLayoutAttribute:NSLayoutAttributeTop];
}

- (NSLayoutConstraint *)getBottomConstraint:(UIView *)view {
    return [self getConstraintInView:view forLayoutAttribute:NSLayoutAttributeBottom];
}

- (NSLayoutConstraint *)getHeightConstraint:(UIView *)view {
    return [self getConstraintInView:view forLayoutAttribute:NSLayoutAttributeHeight];
}

- (NSLayoutConstraint *)getConstraintInView:(UIView *)view forLayoutAttribute:(NSLayoutAttribute)layoutAttribute {
    NSLayoutConstraint *foundConstraint = nil;
    
    if (layoutAttribute == NSLayoutAttributeTop || layoutAttribute == NSLayoutAttributeBottom ||
        layoutAttribute == NSLayoutAttributeLeading || layoutAttribute == NSLayoutAttributeTrailing) {
        
        for (NSLayoutConstraint *constraint in view.superview.constraints) {
            if ((constraint.firstAttribute == layoutAttribute && [view isEqual:constraint.firstItem]) ||
                (constraint.secondAttribute == layoutAttribute && [view isEqual:constraint.secondItem])) {
                foundConstraint = constraint;
                break;
            }
        }
    }
    else {
        for (NSLayoutConstraint *constraint in view.constraints) {
            if (constraint.firstAttribute == layoutAttribute &&
                constraint.secondAttribute == NSLayoutAttributeNotAnAttribute) {
                foundConstraint = constraint;
                break;
            }
        }
    }
    
    if (!foundConstraint) {
        [self logConstraints:view.constraints];
    }
    
    return foundConstraint;
}

- (NSString *)nameForConstraintAttribute:(NSLayoutAttribute)attribute {
    switch (attribute) {
        case NSLayoutAttributeLeft:
            return @"Left";
            break;
            
        case NSLayoutAttributeRight:
            return @"Right";
            break;
            
        case NSLayoutAttributeTop:
            return @"Top";
            break;
            
        case NSLayoutAttributeBottom:
            return @"Bottom";
            break;
            
        case NSLayoutAttributeLeading:
            return @"Leading";
            break;
            
        case NSLayoutAttributeTrailing:
            return @"Trailing";
            break;
            
        case NSLayoutAttributeWidth:
            return @"Width";
            break;
            
        case NSLayoutAttributeHeight:
            return @"Height";
            break;
            
        case NSLayoutAttributeCenterX:
            return @"CenterX";
            break;
            
        case NSLayoutAttributeCenterY:
            return @"CenterY";
            break;
            
        case NSLayoutAttributeBaseline:
            return @"Baseline";
            break;
            
        case NSLayoutAttributeNotAnAttribute:
            return @"None";
            break;
            
        default:
            return @"Unknown";
            break;
    }
}

#pragma mark - User Actions
#pragma mark -

- (void)mainTapGestureRecognized:(UITapGestureRecognizer *)sender {
    DebugLog(@"%@", NSStringFromSelector(_cmd));
    
    [self.view endEditing:TRUE];
}

#pragma mark - UIGestureRecognizerDelegate
#pragma mark -

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer {
    BOOL result = TRUE;
    if ([self.mainTapGestureRecognizer isEqual:gestureRecognizer]) {
        UIView *view = gestureRecognizer.view;
        CGPoint loc = [gestureRecognizer locationInView:view];
        UIView *touchedView = [view hitTest:loc withEvent:nil];
        
        // only allow for touching the main view or the content view within the main scroll view
        
        UIScrollView *scrollView = [self mainScrollView];
        UIView *contentView = [self mainContentView];
        
        result = isKeyboardVisible && ([self.view isEqual:touchedView] || [scrollView isEqual:touchedView] || [contentView isEqual:touchedView]);
    }
    return result;
}

#pragma mark - Notifications
#pragma mark -

- (void)keyboardWillShowNotification:(NSNotification *)notification {
	CGFloat height = [self getKeyboardHeight:notification forBeginning:TRUE];
	NSTimeInterval duration = [self getDuration:notification];
    UIViewAnimationCurve animationCurve = [self getAnimationCurve:notification];
    UIViewAnimationOptions animationOptions = [self animationOptionsWithCurve:animationCurve];
    
    [self keyboardWillShowWithHeight:height duration:duration animationOptions:animationOptions];
}

- (void)keyboardWillHideNotification:(NSNotification *)notification {
	CGFloat height = [self getKeyboardHeight:notification forBeginning:FALSE];
	NSTimeInterval duration = [self getDuration:notification];
    UIViewAnimationCurve animationCurve = [self getAnimationCurve:notification];
    UIViewAnimationOptions animationOptions = [self animationOptionsWithCurve:animationCurve];
    
    [self keyboardWillHideWithHeight:height duration:duration animationOptions:animationOptions];
}

- (void)keyboardDidShowNotification:(NSNotification *)notification {
    isKeyboardVisible = TRUE;
    [self keyboardDidShow];
}

- (void)keyboardDidHideNotification:(NSNotification *)notification {
    isKeyboardVisible = FALSE;
    [self keyboardDidHide];
}

#pragma mark - Private
#pragma mark -

- (NSTimeInterval)getDuration:(NSNotification *)notification {
	NSTimeInterval duration;
	NSValue *durationValue = [notification.userInfo objectForKey:UIKeyboardAnimationDurationUserInfoKey];
	[durationValue getValue:&duration];
	
	return duration;
}

- (CGFloat)getKeyboardHeight:(NSNotification *)notification forBeginning:(BOOL)forBeginning {
	NSDictionary *info = [notification userInfo];
	
	CGFloat keyboardHeight;
    
    NSValue *boundsValue = nil;
    if (forBeginning) {
        boundsValue = [info valueForKey:UIKeyboardFrameBeginUserInfoKey];
    }
    else {
        boundsValue = [info valueForKey:UIKeyboardFrameEndUserInfoKey];
    }
    
    UIDeviceOrientation orientation = [[UIDevice currentDevice] orientation];
    if (UIDeviceOrientationIsLandscape(orientation)) {
        keyboardHeight = [boundsValue CGRectValue].size.width;
    }
    else {
        keyboardHeight = [boundsValue CGRectValue].size.height;
    }
    
	return keyboardHeight;
}

- (UIViewAnimationCurve)getAnimationCurve:(NSNotification *)notification {
    UIViewAnimationCurve animationCurve;
	NSValue *animationCurveValue = [notification.userInfo objectForKey:UIKeyboardAnimationCurveUserInfoKey];
    [animationCurveValue getValue:&animationCurve];
    
    return animationCurve;
}

- (UIViewAnimationOptions)animationOptionsWithCurve:(UIViewAnimationCurve)curve {
    switch (curve) {
        case UIViewAnimationCurveEaseInOut:
            return UIViewAnimationOptionCurveEaseInOut;
        case UIViewAnimationCurveEaseIn:
            return UIViewAnimationOptionCurveEaseIn;
        case UIViewAnimationCurveEaseOut:
            return UIViewAnimationOptionCurveEaseOut;
        case UIViewAnimationCurveLinear:
            return UIViewAnimationOptionCurveLinear;
        default:
            // return whatever it provided because iOS 7 uses an undocumented animation value of 7 (not cool, Apple)
            // http://stackoverflow.com/questions/18837166/how-to-mimic-keyboard-animation-on-ios-7-to-add-done-button-to-numeric-keyboar
            return (UIViewAnimationOptions)UIViewAnimationOptionCurveLinear;
    }
}

- (UIScrollView *)mainScrollView {
    UIScrollView *scrollView = nil;
    if (self.view.subviews.count && [self.view.subviews[0] isKindOfClass:[UIScrollView class]]) {
        scrollView = (UIScrollView *)self.view.subviews[0];
    }
    return scrollView;
}

- (UIView *)mainContentView {
    UIView *contentView = nil;
    UIScrollView *scrollView = [self mainScrollView];
    if (scrollView && scrollView.subviews.count) {
        contentView = scrollView.subviews[0];
    }
    
    return contentView;
}

@end
