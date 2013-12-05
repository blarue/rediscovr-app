//
//  RMWalkthroughViewController.m
//  Rediscovr
//
//  Created by Brennan Stehling on 12/4/13.
//  Copyright (c) 2013 Rediscovr. All rights reserved.
//

// Customizing Page Control: http://iphoneappcode.blogspot.in/2012/03/custom-uipagecontrol.html

#import "RMWalkthroughViewController.h"

@interface RMWalkthroughViewController () <UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UIScrollViewDelegate>

@property (strong, nonatomic) NSArray *items;

@property (weak, nonatomic) IBOutlet UICollectionView *collectionView;

@property (weak, nonatomic) IBOutlet UIPageControl *pageControl;

@end

@implementation RMWalkthroughViewController

#pragma mark - View Lifecycle
#pragma mark -

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.items = @[
                   @{
                       @"Title" : @"Selectively share moments",
                       @"Subtitle" : @"Sunt nisi elit, assumenda nihil raw denim duis sed Cosby sweater ex farm-to-table do McSweeney's.",
                       @"PhotoName" : @"",
                       @"OverlayName" : @""
                       },
                   @{
                       @"Title" : @"Keep your moments private",
                       @"Subtitle" : @"Pinterest farm-to-table ethnic hoodie delectus irony twee viral locavore selvage.",
                       @"PhotoName" : @"",
                       @"OverlayName" : @""
                       },
                   @{
                       @"Title" : @"Remember with reminders",
                       @"Subtitle" : @"Artisan viral meh, est irure selvage Tumblr meggings Shoreditch sriracha.",
                       @"PhotoName" : @"",
                       @"OverlayName" : @""
                       }
                   ];
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    UICollectionViewFlowLayout *layout = (id) self.collectionView.collectionViewLayout;
    layout.itemSize = self.collectionView.frame.size;
}

#pragma mark - UICollectionViewDataSource
#pragma mark -

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return self.items.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *CommentsCellIdentifier = @"PagerCell";
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:CommentsCellIdentifier forIndexPath:indexPath];
    MAAssert(cell, @"Cell is required");
    
    UILabel *titleLabel = (UILabel *)[cell viewWithTag:1];
    UILabel *subtitleLabel = (UILabel *)[cell viewWithTag:2];
    
    NSDictionary *item = self.items[indexPath.item];
    titleLabel.text = item[@"Title"];
    subtitleLabel.text = item[@"Subtitle"];
    
//    UICollectionViewFlowLayout *layout = (id)collectionView.collectionViewLayout;
//    layout.itemSize = collectionView.frame.size;
    
//    DebugLog(@"minimumLineSpacing: %f", layout.minimumLineSpacing);
//    DebugLog(@"minimumInteritemSpacing: %f", layout.minimumInteritemSpacing);
//    LOG_SIZE(@"itemSize", layout.itemSize);
//    LOG_SIZE(@"headerReferenceSize", layout.headerReferenceSize);
//    LOG_SIZE(@"footerReferenceSize", layout.footerReferenceSize);
//    LOG_INSET(@"sectionInset", layout.sectionInset);

    return cell;
}

#pragma mark - UICollectionViewDelegate
#pragma mark -

#pragma mark - UICollectionViewDelegateFlowLayout
#pragma mark -

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    return collectionView.frame.size;
}

#pragma mark - UIScrollViewDelegate
#pragma mark -

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    static NSInteger previousPage = 0;
    CGFloat pageWidth = CGRectGetWidth(scrollView.frame);
    float fractionalPage = scrollView.contentOffset.x / pageWidth;
    NSInteger page = lround(fractionalPage);
    if (previousPage != page) {
        // Page has changed
        // Do your thing!
        previousPage = page;
    }
    
    self.pageControl.currentPage = page;
}

@end
