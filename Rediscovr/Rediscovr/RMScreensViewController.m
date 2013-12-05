//
//  RMScreensViewController.m
//  Rediscovr
//
//  Created by Brennan Stehling on 12/4/13.
//  Copyright (c) 2013 Rediscovr. All rights reserved.
//

#import "RMScreensViewController.h"

@interface RMScreensViewController () <UITableViewDataSource, UITableViewDelegate>

@property (strong, nonatomic) NSArray *screens;

//@property (weak, nonatomic) NSDictionary *selectedScreen;



@end

@implementation RMScreensViewController

- (void)viewDidLoad {
    [super viewDidLoad];
	// Do any additional setup after loading the view.
    
    self.screens = @[
                     @{ @"Title" : @"Splash", @"StoryboardID" : @"SplashVC" },
                     @{ @"Title" : @"Sign Up", @"StoryboardID" : @"SignUpVC" },
                     @{ @"Title" : @"Log In", @"StoryboardID" : @"LogInVC" },
                     @{ @"Title" : @"Walkthrough", @"StoryboardID" : @"WalkthroughVC" },
                     @{ @"Title" : @"Left Sidebar", @"StoryboardID" : @"LeftSidebarVC" },
                     @{ @"Title" : @"Home", @"StoryboardID" : @"HomeVC" },
                     @{ @"Title" : @"Moment", @"StoryboardID" : @"MomentVC" },
                     @{ @"Title" : @"Months", @"StoryboardID" : @"MonthsVC" },
                     @{ @"Title" : @"Years", @"StoryboardID" : @"YearsVC" },
                     @{ @"Title" : @"All Moments", @"StoryboardID" : @"AllMomentsVC" },
                     
                     
                     @{ @"Title" : @"My Profile", @"StoryboardID" : @"MyProfileVC" },
                     @{ @"Title" : @"Collaborators (List of People)", @"StoryboardID" : @"CollaboratorsVC" },
                     @{ @"Title" : @"Profile of Collaborator", @"StoryboardID" : @"CollaboratorVC" },
                     @{ @"Title" : @"Notifications", @"StoryboardID" : @"NotificationsVC" },
                     @{ @"Title" : @"Settings", @"StoryboardID" : @"SettingsVC" },
                     @{ @"Title" : @"Add a Moment", @"StoryboardID" : @"AddAMomentVC" },
                     @{ @"Title" : @"SelectMedia", @"StoryboardID" : @"SelectMediaVC" },
                     @{ @"Title" : @"Current Collaborators", @"StoryboardID" : @"CurrentCollaboratorsVC" },

                     @{ @"Title" : @"Select Date", @"StoryboardID" : @"SelectDateVC" },
                     @{ @"Title" : @"Select Location", @"StoryboardID" : @"SelectLocationVC" },
                     @{ @"Title" : @"Set Reminder", @"StoryboardID" : @"SetReminderVC" },
                     @{ @"Title" : @"Set End Reminder", @"StoryboardID" : @"SetEndReminderVC" },
                     @{ @"Title" : @"Select a Photo", @"StoryboardID" : @"SelectAPhotoVC" },
                     @{ @"Title" : @"Invite Collaborators", @"StoryboardID" : @"InviteCollaboratorsVC" }
                     ];
}

#pragma mark - UITableViewDataSource
#pragma mark -

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.screens.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *CellIdentifier = @"ScreenCell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    
    NSDictionary *screen = self.screens[indexPath.row];
    
    UILabel *label = (UILabel *)[cell viewWithTag:1];
    label.text = screen[@"Title"];
    
    return cell;
}

#pragma mark - UITableViewDelegate
#pragma mark -

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    NSDictionary *screen = self.screens[indexPath.row];
    NSString *storyboardID = screen[@"StoryboardID"];
    UIViewController *vc = [self.storyboard instantiateViewControllerWithIdentifier:storyboardID];
    vc.title = screen[@"Title"];
    
    [self.navigationController pushViewController:vc animated:TRUE];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.25 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [tableView deselectRowAtIndexPath:indexPath animated:TRUE];
    });
}

@end
